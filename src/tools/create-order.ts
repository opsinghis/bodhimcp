import { z } from 'zod';
import { lookupById } from '../catalog/loader';
import { getInventoryForProduct } from '../shopping/inventory';
import type { Order, OrderItem } from '../shopping/types';

// In-memory order store (session-scoped, resets on server restart)
const orders: Map<string, Order> = new Map();

export const createOrderSchema = {
  items: z
    .array(
      z.object({
        productId: z.string().describe('Product ID'),
        quantity: z.number().min(1).max(10).describe('Quantity to order'),
      }),
    )
    .min(1)
    .max(10)
    .describe('Items to order'),
  customerEmail: z
    .string()
    .email()
    .describe('Customer email address'),
  shippingPostcode: z
    .string()
    .optional()
    .describe('UK shipping postcode'),
};

function generateOrderId(): string {
  const num = 10000 + Math.floor(Math.random() * 90000);
  return `ORD-${num}`;
}

export async function createOrder(params: {
  items: OrderItem[];
  customerEmail: string;
  shippingPostcode?: string;
}) {
  const { items, customerEmail, shippingPostcode } = params;

  // Validate products and check inventory
  const errors: string[] = [];
  const orderItems: Order['items'] = [];
  let totalPrice = 0;

  for (const item of items) {
    const product = lookupById(item.productId);
    if (!product) {
      errors.push(`Product ${item.productId} not found`);
      continue;
    }

    const inventory = getInventoryForProduct(item.productId);
    if (inventory.status === 'out_of_stock') {
      errors.push(`Product ${item.productId} (${product.product_name}) is out of stock. Restock expected: ${inventory.restock_date}`);
      continue;
    }

    if (inventory.quantity < item.quantity) {
      errors.push(`Product ${item.productId} (${product.product_name}): only ${inventory.quantity} available, requested ${item.quantity}`);
      continue;
    }

    const price = product.price ?? 0;
    const subtotal = price * item.quantity;
    orderItems.push({
      product_id: product.product_id,
      product_name: product.product_name,
      price,
      quantity: item.quantity,
      subtotal: Math.round(subtotal * 100) / 100,
    });
    totalPrice += subtotal;
  }

  if (errors.length > 0 && orderItems.length === 0) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ error: 'Cannot create order', issues: errors }),
        },
      ],
    };
  }

  // Estimate delivery: 3-5 business days from now
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  // Skip weekends
  if (deliveryDate.getDay() === 0) deliveryDate.setDate(deliveryDate.getDate() + 1);
  if (deliveryDate.getDay() === 6) deliveryDate.setDate(deliveryDate.getDate() + 2);

  const order: Order = {
    order_id: generateOrderId(),
    items: orderItems,
    total_price: Math.round(totalPrice * 100) / 100,
    customer_email: customerEmail,
    shipping_postcode: shippingPostcode,
    estimated_delivery: deliveryDate.toISOString().split('T')[0],
    status: 'confirmed',
    created_at: new Date().toISOString(),
  };

  orders.set(order.order_id, order);

  const result: Record<string, unknown> = {
    ...order,
    message: `Order ${order.order_id} confirmed! Estimated delivery by ${order.estimated_delivery}.`,
  };

  if (errors.length > 0) {
    result.warnings = errors;
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
