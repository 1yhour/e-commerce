export interface HeroSlide {
  id: number;
  image: string;
  headlineNormal: string;
  headlineLight: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Static placeholder data — replace with API call when backend is ready */
export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop",
    headlineNormal: "Timeless Fashion,",
    headlineLight: "Conscious Choices.",
    description:
      "Sustainably designed, effortlessly worn. Our pieces are made with premium materials, and wardrobe that stands the test of time.",
    ctaLabel: "Explore the Collections",
    ctaHref: "#explore-collections",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
    headlineNormal: "Modern Elegance,",
    headlineLight: "Everyday Comfort.",
    description:
      "Explore the new autumn collection. Carefully curated for your daily adventures.",
    ctaLabel: "Explore the Collections",
    ctaHref: "#explore-collections",
  },
];
