"use client";

import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { type HeroSlide } from "@/data/hero-slides";

interface HeroSectionProps {
  slides: HeroSlide[];
}

export function HeroSection({ slides }: HeroSectionProps) {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="w-full">
      <Carousel
        opts={{ loop: true, watchDrag: true }}
        className="relative w-full h-screen min-h-[600px] overflow-hidden"
      >
        <CarouselContent className="h-screen min-h-[600px] m-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="relative p-0 h-full w-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-20 max-w-7xl mx-auto">
                <div className="max-w-2xl text-white">
                  <h1
                    className="text-6xl md:text-8xl tracking-wide mb-6"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    <span className="font-normal block mb-1">
                      {slide.headlineNormal}
                    </span>
                    <span className="font-light italic block text-white/80">
                      {slide.headlineLight}
                    </span>
                  </h1>

                  <p
                    className="text-sm md:text-base mb-12 max-w-md leading-loose text-white/75 tracking-widest font-light"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {slide.description}
                  </p>

                  <Button
                    asChild
                    variant="outline"
                    className="rounded-none border-white bg-transparent text-white text-xs font-light tracking-[0.25em] uppercase px-10 py-8 hover:bg-white hover:text-black transition-all duration-500"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    <Link 
                      href={slide.ctaHref}
                      onClick={(e) => handleScroll(e, slide.ctaHref)}
                    >
                      {slide.ctaLabel}
                    </Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation — bottom right */}
        <div className="absolute bottom-10 right-10 z-20 flex gap-4">
          <CarouselPrevious className="static translate-y-0 translate-x-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white border-white/50 hover:bg-white/40 hover:text-white transition-all duration-300" />
          <CarouselNext className="static translate-y-0 translate-x-0 w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-all duration-300 shadow-lg" />
        </div>
      </Carousel>
    </section>
  );
}
