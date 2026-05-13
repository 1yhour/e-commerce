import { CategoryPageContent } from "@/components/store/category-page-content";

const WOMEN_CATEGORY_ID = process.env.NEXT_PUBLIC_WOMEN_CATEGORY_ID;
export default function WomenPage() {
  return (
    <CategoryPageContent 
      categoryName="Women" 
      categoryId={WOMEN_CATEGORY_ID as string} 
    />
  );
}