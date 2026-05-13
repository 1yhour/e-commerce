import { CategoryPageContent } from "@/components/store/category-page-content";

const KIDS_CATEGORY_ID = process.env.NEXT_PUBLIC_KIDS_CATEGORY_ID;
export default function KidsPage() {
  return (
    <CategoryPageContent 
      categoryName="Kids" 
      categoryId={KIDS_CATEGORY_ID as string}
    />
  );
}
