"use client";

import { CategoryPageContent } from "@/components/store/category-page-content";
const MEN_CATEGORY_ID = process.env.NEXT_PUBLIC_MEN_CATEGORY_ID;
export default function MenPage() {
  return (
    <CategoryPageContent 
      categoryName="Men" 
      categoryId={MEN_CATEGORY_ID as string}
    />
  );
}