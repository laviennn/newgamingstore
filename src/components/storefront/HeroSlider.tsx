"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";

import Image from "next/image";

interface HeroSliderProps {
  sliders: string[];
  domain: string;
}

export function HeroSlider({ sliders, domain }: HeroSliderProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  const carouselPlugins = React.useMemo(() => [plugin.current], []);

  return (
    <Carousel 
      plugins={carouselPlugins} 
      className="w-full max-w-6xl mx-auto group"
      onMouseEnter={() => plugin.current.stop()}
      onMouseLeave={() => plugin.current.reset()}
    >
      <CarouselContent>
        {sliders.length > 0 ? (
          sliders.map((url: string, index: number) => (
            <CarouselItem key={index}>
              <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[3/1] w-full rounded-2xl bg-muted overflow-hidden flex items-center justify-center ring-1 ring-border shadow-2xl">
                <Image src={url} alt={`Banner ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 1200px" priority={index === 0} className="object-cover" />
              </div>
            </CarouselItem>
          ))
        ) : (
          <CarouselItem>
            <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[3/1] w-full rounded-2xl bg-muted overflow-hidden flex items-center justify-center ring-1 ring-border shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-background flex items-center px-8 md:px-16">
                 <div className="max-w-lg space-y-4">
                   <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white">
                     Welcome to {domain}
                   </h2>
                   <p className="text-lg text-white/80">
                     Get your favorite game credits instantly. Best prices guaranteed!
                   </p>
                   <Button size="lg" className="mt-4 shadow-xl text-primary bg-white hover:bg-zinc-200">Top Up Now</Button>
                 </div>
              </div>
            </div>
          </CarouselItem>
        )}
      </CarouselContent>
      {sliders.length > 1 && (
        <>
          <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white border-0 hover:bg-black/80 w-10 h-10" />
          <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white border-0 hover:bg-black/80 w-10 h-10" />
        </>
      )}
    </Carousel>
  );
}
