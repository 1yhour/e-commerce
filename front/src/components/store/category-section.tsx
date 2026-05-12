import Link from "next/link";
import Image from "next/image";
import { type Category } from "@/data/categories";

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    // Step 1: Remove horizontal padding to allow full screen bleed
    <section id="explore-collections" className="w-full bg-stone-50 pt-25">
      
      {/* Step 2: Center the section header in its own container with original padding */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-16 text-center mb-14">
        <p
          className="text-[10px] tracking-[0.35em] uppercase text-stone-400 mb-3"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Curated Collections
        </p>
        <h2
          className="text-5xl md:text-6xl font-normal text-black"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "0.02em" }}
        >
          Find Your Look
        </h2>
      </div>

      {/* Step 3: Create a full-width grid without width constraints and seamless images (gap-0) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            // Add w-full for full-width links within the grid cell
            className="group relative block cursor-pointer w-full"
          >
            {/* Step 4: Transform to full-height image container with text overlay */}
            <div className="relative overflow-hidden aspect-[1/1.3] md:aspect-[3/4]">
              <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              
              {/* Subtle overlay (darken on hover) */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500 z-10" />
              
              {/* Dark gradient vignette at the bottom for text readability */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 via-black/30 to-transparent z-15" />
            
              <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-8 flex flex-col justify-end text-white">
                <h3
                  className="text-3xl md:text-4xl font-normal"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {category.title}
                </h3>
                <span
                  className="text-[10px] tracking-[0.25em] uppercase text-white/80 mt-1.5"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Shop Collection
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}