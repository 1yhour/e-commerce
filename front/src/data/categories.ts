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
    href: "/women",
    image: "/image/women_image.jpg",
  },
  {
    id: 2,
    title: "Men",
    href: "/men",
    image: "/image/men_image.jpg",
  },
  {
    id: 3,
    title: "Kids",
    href: "/kids",
    image: "/image/kid_image.jpg",
  },
];
