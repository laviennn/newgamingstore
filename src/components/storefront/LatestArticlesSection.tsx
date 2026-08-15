"use client";

import Image from "next/image";
import Link from "next/link";
import { getDictionary, Language } from "@/lib/dictionary";

const fixUrl = (url: string | null) => {
  if (!url) return '';
  return url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LatestArticlesSection({ articles, language = 'id' }: { articles: any[], language?: Language }) {
  const dict = getDictionary(language);
  if (!articles || articles.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-8 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-black tracking-widest text-foreground uppercase mb-3">{dict.home_articles_title}</h2>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {dict.home_articles_desc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {articles.slice(0, 3).map((article, index) => (
          <Link href={`/blog/${article.slug}`} key={article.id}>
            <div className="relative aspect-[4/5] md:aspect-[3/4] w-full rounded-[24px] overflow-hidden bg-card border border-border group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-xl hover:shadow-primary/30">
              {/* Background Image */}
              {article.image_url ? (
                <Image 
                  src={fixUrl(article.image_url)} 
                  alt={article.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw" 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-muted-foreground">
                  {dict.home_articles_no_image}
                </div>
              )}
              
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
              
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 md:p-8 pointer-events-none">
                <div className="space-y-3">
                  <span className="text-xs md:text-sm font-semibold text-yellow-400 uppercase tracking-wider">
                    {article.author || dict.home_articles_admin}
                  </span>
                  
                  <h3 className="font-bold text-foreground text-lg md:text-xl leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  
                  {/* Fake excerpt (showing title again as per design reference, or can parse content) */}
                  <p className="text-xs md:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {article.title}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <Link href="/blog">
          <button className="px-6 py-3 rounded-xl font-bold text-primary-foreground bg-primary hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            {dict.home_articles_see_all}
          </button>
        </Link>
      </div>
    </div>
  );
}
