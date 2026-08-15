"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Flame } from "lucide-react";
import { getDictionary, Language } from "@/lib/dictionary";
import { Currency, formatCurrency } from "@/lib/currencyUtils";

export interface FlashSaleProduct {
  id: string;
  gameSlug: string;
  gameName: string;
  productName: string;
  image: string;
  originalPrice: number;
  discountPrice: number;
  stockRemaining: number;
}

function Countdown({ language = 'id' }: { language?: Language }) {
  const dict = getDictionary(language);
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 9,
    minutes: 17,
    seconds: 14,
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          if (minutes > 0) {
            minutes--;
            seconds = 59;
          } else {
            if (hours > 0) {
              hours--;
              minutes = 59;
              seconds = 59;
            } else {
              if (days > 0) {
                days--;
                hours = 23;
                minutes = 59;
                seconds = 59;
              }
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-2 text-white font-bold text-xl md:text-2xl tracking-widest ml-0 md:ml-4">
      <div className="flex items-baseline gap-1">
        <span>{formatNumber(timeLeft.days)}</span>
        <span className="text-[10px] text-gray-400 font-normal">{dict.home_flash_days}</span>
      </div>
      <span className="text-gray-500">:</span>
      <div className="flex items-baseline gap-1">
        <span>{formatNumber(timeLeft.hours)}</span>
        <span className="text-[10px] text-gray-400 font-normal">{dict.home_flash_hours}</span>
      </div>
      <span className="text-gray-500">:</span>
      <div className="flex items-baseline gap-1">
        <span>{formatNumber(timeLeft.minutes)}</span>
        <span className="text-[10px] text-gray-400 font-normal">{dict.home_flash_mins}</span>
      </div>
      <span className="text-gray-500">:</span>
      <div className="flex items-baseline gap-1">
        <span>{formatNumber(timeLeft.seconds)}</span>
        <span className="text-[10px] text-gray-400 font-normal">{dict.home_flash_secs}</span>
      </div>
    </div>
  );
}

export function FlashSaleSection({ products, language = 'id', currency = 'IDR' }: { products: FlashSaleProduct[]; language?: Language; currency?: Currency }) {
  const dict = getDictionary(language);
  const plugin = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false })
  );

  const carouselPlugins = React.useMemo(() => [plugin.current], []);

  if (!products || products.length === 0) return null;

  // Ensure enough items so the carousel can actually scroll and loop!
  // On desktop (basis-1/4 or basis-1/5), Embla needs at least 8-10 items to loop flawlessly.
  let displayProducts = [...products];
  if (displayProducts.length > 0 && displayProducts.length < 12) {
    while (displayProducts.length < 12) {
      displayProducts = [...displayProducts, ...products.map(p => ({ ...p, id: p.id + Math.random().toString() }))];
    }
  }

  return (
    <div className="w-full bg-background rounded-2xl border border-border p-4 md:p-6 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex flex-col leading-none">
          <span className="text-[#ffb13b] font-black text-2xl italic tracking-tighter" style={{ textShadow: "2px 2px 0 #cc2900" }}>{dict.home_flash_special}</span>
          <span className="text-[#ffb13b] font-black text-2xl italic tracking-tighter -mt-1" style={{ textShadow: "2px 2px 0 #cc2900" }}>{dict.home_flash_promo}</span>
        </div>

        <Countdown language={language} />
      </div>

      <div className="w-full h-[1px] bg-white/5 mb-6" />

      {/* Carousel */}
      <Carousel
        plugins={carouselPlugins}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full group"
        onMouseEnter={() => plugin.current.stop()}
        onMouseLeave={() => plugin.current.play()}
      >
        <CarouselContent className="-ml-3">
          {displayProducts.map((item) => (
            <CarouselItem key={item.id} className="pl-3 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <Link href={`/game/${item.gameSlug || ''}`}>
                <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer flex flex-col relative h-full">

                  {/* Tag Flash Sale */}
                  <div className="absolute top-0 right-3 z-10 w-9 h-12">
                    <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
                      <path d="M0 5C0 2.23858 2.23858 0 5 0H35C37.7614 0 40 2.23858 40 5V50L20 40L0 50V5Z" fill="#FFC107" />
                      <circle cx="20" cy="8" r="2" fill="#d97706" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pt-2 flex-col leading-none">
                      <span className="text-[8px] font-black text-black transform -rotate-12 -ml-1">Flash</span>
                      <span className="text-[8px] font-black text-black transform -rotate-12 ml-1 mt-0.5">Sale</span>
                    </div>
                  </div>

                  <div className="flex flex-1 p-3 gap-3">
                    {/* Image Box */}
                    <div className="relative w-[90px] h-[110px] rounded-lg overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.productName} fill sizes="90px" className="object-cover" />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card via-card/50 to-transparent" />

                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center flex-1 pr-6 pt-1">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-wider">{item.gameName}</h4>
                      <h3 className="font-bold text-foreground text-sm mt-0.5 line-clamp-1">{item.productName}</h3>

                      <div className="mt-auto pb-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl text-[#FFC107] font-black tracking-tight">{formatCurrency(item.discountPrice, currency)}</span>
                        </div>
                        <div className="text-gray-500 text-xs line-through font-semibold -mt-1">
                          {formatCurrency(item.originalPrice, currency)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="w-full bg-muted h-7 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute left-0 top-0 bottom-0 bg-primary" style={{ width: '40%' }} />
                    <div className="relative z-10 flex items-center gap-1.5 text-white text-[10px] font-bold tracking-wider">
                      <Flame className="w-3.5 h-3.5 text-[#ff5722] fill-[#ff5722]" />
                      {item.stockRemaining} {dict.home_flash_stock_left}
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
