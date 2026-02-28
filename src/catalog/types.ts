export interface Product {
  product_id: string;
  product_name: string;
  price: number | null;
  material: string;
  description: string;
  primary_category: string;
  category: string[];
}

export interface SearchFilters {
  query?: string;
  material?: string;
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}
