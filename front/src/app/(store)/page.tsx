import { HeroSection } from "@/components/store/hero-section";
import { NewArrivalsSection } from "@/components/store/new-arrivals-section";
import { CategorySection } from "@/components/store/category-section";

// Static data — swap these imports for API calls when backend is ready
import { heroSlides } from "@/data/hero-slides";
import { newArrivals } from "@/data/products";
import { categories } from "@/data/categories";

export default function StoreHomePage() {
  return (
    <div className="w-full">
      <HeroSection slides={heroSlides} />
      <NewArrivalsSection products={newArrivals} />
      <CategorySection categories={categories} />
    </div>
  );
}