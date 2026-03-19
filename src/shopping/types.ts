export type Occasion = 'birthday' | 'anniversary' | 'valentines' | 'mothers_day' | 'graduation' | 'self_treat';
export type Recipient = 'her' | 'him' | 'teen' | 'child';
export type Style = 'classic' | 'modern' | 'bold' | 'minimal';
export type Budget = 'under_50' | '50_to_100' | '100_to_200' | 'over_200';

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryItem {
  product_id: string;
  status: InventoryStatus;
  quantity: number;
  restock_date?: string;
}

export interface RecommendationRequest {
  occasion?: Occasion;
  recipient?: Recipient;
  style?: Style;
  budget?: Budget;
  limit?: number;
}

export interface ScoredProduct {
  product_id: string;
  product_name: string;
  price: number | null;
  material: string;
  primary_category: string;
  relevance_score: number;
  reason: string;
}

export interface BundleRequest {
  seedProductId?: string;
  occasion?: Occasion;
  budget?: Budget;
  size?: number;
}

export interface BundleItem {
  product_id: string;
  product_name: string;
  price: number | null;
  material: string;
  primary_category: string;
  role: string; // e.g. "anchor", "complement", "accent"
}

export interface Bundle {
  items: BundleItem[];
  total_price: number;
  item_count: number;
  occasion?: string;
  savings_narrative: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  order_id: string;
  items: {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  total_price: number;
  customer_email: string;
  shipping_postcode?: string;
  estimated_delivery: string;
  status: 'confirmed';
  created_at: string;
}

export interface ComparisonProduct {
  product_id: string;
  product_name: string;
  price: number | null;
  material: string;
  primary_category: string;
  collection: string | null;
  categories: string[];
}

export interface ComparisonResult {
  products: ComparisonProduct[];
  highlights: {
    cheapest: string | null;
    most_premium: string | null;
    material_differences: boolean;
    unique_materials: string[];
  };
  product_count: number;
}
