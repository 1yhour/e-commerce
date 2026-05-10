export interface Product {
  id: number;
  name: string;
  /** e.g. "Women" | "Men" | "Kids" — will map to a backend category slug */
  category: string;
  /** Formatted price string, e.g. "$248" — replace with number from API and format on render */
  price: string;
  image: string;
  /** Promo badge label, e.g. "New" | "Limited" | null */
  tag: string | null;
}

/** Static placeholder data — replace with API call when backend is ready */
export const newArrivals: Product[] = [
  {
    id: 1,
    name: "Silk Slip Dress",
    category: "Women",
    price: "$248",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop",
    tag: "New",
  },
  {
    id: 2,
    name: "Oversized Blazer",
    category: "Women",
    price: "$195",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4871?q=80&w=800&auto=format&fit=crop",
    tag: null,
  },
  {
    id: 3,
    name: "Linen Trousers",
    category: "Men",
    price: "$165",
    image:
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=800&auto=format&fit=crop",
    tag: "New",
  },
  {
    id: 4,
    name: "Cashmere Knit",
    category: "Women",
    price: "$320",
    image:
      "https://images.unsplash.com/photo-1512327428383-f581b5a5bff7?q=80&w=800&auto=format&fit=crop",
    tag: null,
  },
  {
    id: 5,
    name: "Tailored Coat",
    category: "Men",
    price: "$485",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    tag: "Limited",
  },
];
