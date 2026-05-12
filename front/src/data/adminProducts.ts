export interface Product {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  image?: string; // Optional if you still want to keep it for UI
}

export interface ProductFormData {
  title: string;
  slug: string;
  category_id: string;
  price: string;
  stock_quantity: string;
  description: string;
  is_active: boolean;
  image: File | string | null;
}

export const categories = ["Women", "Men", "Kids", "Accessories"];

export const initialProducts: Product[] = [
  {
    id: "1",
    title: "Silk Slip Dress",
    slug: "silk-slip-dress",
    category_id: "987e6543-e21b-12d3-a456-426614174000",
    description: "Elegant silk slip dress.",
    price: 248,
    stock_quantity: 34,
    is_active: true,
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=200&auto=format&fit=crop",

  },
  {
    id: "2",
    title: "Oversized Blazer",
    slug: "oversized-blazer",
    category_id: "987e6543-e21b-12d3-a456-426614174000",
    description: "Classic oversized blazer.",
    price: 195,
    stock_quantity: 12,
    is_active: true,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4871?q=80&w=200&auto=format&fit=crop",

  },
  {
    id: "3",
    title: "Linen Trousers",
    slug: "linen-trousers",
    category_id: "123e4567-e89b-12d3-a456-426614174000",
    description: "Comfortable linen trousers.",
    price: 165,
    stock_quantity: 0,
    is_active: true,
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=200&auto=format&fit=crop",

  },
  {
    id: "4",
    title: "Cashmere Knit",
    slug: "cashmere-knit",
    category_id: "987e6543-e21b-12d3-a456-426614174000",
    description: "Soft cashmere knit sweater.",
    price: 320,
    stock_quantity: 89,
    is_active: true,
    image: "https://images.unsplash.com/photo-1512327428383-f581b5a5bff7?q=80&w=200&auto=format&fit=crop",

  },
  {
    id: "5",
    title: "Tailored Coat",
    slug: "tailored-coat",
    category_id: "123e4567-e89b-12d3-a456-426614174000",
    description: "Warm tailored coat.",
    price: 485,
    stock_quantity: 7,
    is_active: true,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
];
