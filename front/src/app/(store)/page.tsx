import { HeroSection } from "@/components/store/hero-section";
import { NewArrivalsSection } from "@/components/store/new-arrivals-section";
import { CategorySection } from "@/components/store/category-section";

// Static data
import { heroSlides } from "@/data/hero-slides";
import { categories } from "@/data/categories";

// async function getProducts() {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?paginate=5&sort=latest`, {
//       next: { revalidate: 60 } // Revalidate every minute
//     });
//     if (!res.ok) throw new Error('Failed to fetch products');
//     const json = await res.data || await res.json();
//     return json.data || json;
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     return [];
//   }
// }

export default async function StoreHomePage() {

  return (
    <div className="w-full">
      <HeroSection slides={heroSlides} />
      <NewArrivalsSection />
      <CategorySection categories={categories} />
    </div>
  );
}