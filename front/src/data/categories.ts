export interface Category {
  id: number;
  title: string;
  href: string;
  image: string;
}

/** Static placeholder data — replace with API call when backend is ready */
export const categories: Category[] = [
  {
    id: 1,
    title: "Women",
    href: "/products/women",
    image:
      "https://images.unsplash.com/photo-1550614000-4b95dd24495e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Men",
    href: "/products/men",
    image:
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Kids",
    href: "/products/kids",
    image:
      "https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=800&auto=format&fit=crop",
  },
];
