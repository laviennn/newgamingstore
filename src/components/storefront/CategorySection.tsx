"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Gamepad2, Sparkles, Ticket, Wallet, Globe, Tv, Flame } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Gamepad2: <Gamepad2 className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4 text-yellow-400" />,
  Ticket: <Ticket className="w-4 h-4 text-orange-300" />,
  Wallet: <Wallet className="w-4 h-4 text-green-300" />,
  Globe: <Globe className="w-4 h-4 text-blue-300" />,
  Tv: <Tv className="w-4 h-4 text-gray-400" />,
  Flame: <Flame className="w-4 h-4 text-orange-500" />,
};

const fixUrl = (url: string | null) => {
  if (!url) return '';
  return url.replace(/https?:\/\/[^\/]+\.r2\.dev/, 'https://assets.newgamingstore.com');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CategorySection({ categories, games }: { categories: any[], games: any[] }) {
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(categories[0]?.id || null);

  const filteredGames = activeCategoryId 
    ? games.filter(g => g.category_id === activeCategoryId)
    : games;

  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full">
      {/* Category Tabs */}
      <ScrollArea className="w-full mb-8">
        <div className="flex w-max space-x-3 pb-4">
          {categories.map(cat => (
            <Button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              variant={activeCategoryId === cat.id ? "default" : "outline"}
              className={`rounded-full px-5 md:px-6 h-10 md:h-12 transition-all ${
                activeCategoryId === cat.id 
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary shadow-lg shadow-primary/40 font-bold tracking-wide" 
                  : "bg-transparent border-white/10 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {ICON_MAP[cat.icon_name] && <span className="mr-2">{ICON_MAP[cat.icon_name]}</span>}
              {cat.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>

      {/* Games Grid - Flex Centered for balanced incomplete rows */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full">
        {filteredGames.map(game => (
          <Link 
            href={`/game/${game.slug}`} 
            key={game.id}
            className="w-[calc((100%-24px)/3)] md:w-[calc((100%-72px)/4)] lg:w-[calc((100%-120px)/6)] shrink-0"
          >
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-card border border-border group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/30">
              {/* Background Poster / Image */}
              {game.image_url ? (
                <Image 
                  src={fixUrl(game.image_url)} 
                  alt={game.name} 
                  fill 
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw" 
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-900">
                  <span className="font-bold text-white mb-2">{game.name}</span>
                  <span className="text-xs text-muted-foreground">Cover Not Found</span>
                </div>
              )}

              {/* Bottom Dark Gradient Overlay (Only visible on hover) */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/95 to-transparent flex flex-col justify-end p-3.5 md:p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                
                {/* Wavy Crest Badge Overlay */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-primary to-primary/50 p-[1px] shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-110">
                  <div className="w-full h-full bg-card rounded-[11px] flex items-center justify-center">
                    <span className="text-amber-400 text-xs font-black">👑</span>
                  </div>
                </div>

                {/* Text Content */}
                <div className="text-center space-y-0.5 pt-2">
                  <h3 className="font-extrabold text-foreground text-xs md:text-sm tracking-tight uppercase line-clamp-1 group-hover:text-primary transition-colors drop-shadow-md">
                    {game.name}
                  </h3>
                  {game.developer && (
                    <p className="text-[10px] md:text-xs font-black text-primary tracking-wider uppercase drop-shadow-sm group-hover:text-primary/80 transition-colors">
                      {game.developer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {filteredGames.length === 0 && (
         <div className="text-center py-16 text-slate-400 bg-black/20 rounded-2xl border border-white/5">
            Tidak ada game di kategori ini.
         </div>
      )}
    </div>
  );
}
