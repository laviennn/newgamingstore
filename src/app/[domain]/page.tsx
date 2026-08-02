import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { HeroSlider } from "@/components/storefront/HeroSlider";
import { FlashSaleSection } from "@/components/storefront/FlashSaleSection";
import { CategorySection } from "@/components/storefront/CategorySection";
import { SnowfallEffect } from "@/components/storefront/SnowfallEffect";
import { LatestArticlesSection } from "@/components/storefront/LatestArticlesSection";
import { FaqSection } from "@/components/storefront/FaqSection";

export const dynamic = "force-dynamic";

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let popularGames: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let flashSaleProducts: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tenantConfig: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allGames: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let articles: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let faqs: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let paymentChannels: any[] = [];

  const fixUrl = (url: string | null) => {
    if (!url) return '';
    return url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com');
  };

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();

      // Fetch Popular Games (Filter by is_popular = true, fallback to limit 6 if none tagged)
      let { data: gamesData } = await supabase.from('games').select('*').eq('is_popular', true);
      if (!gamesData || gamesData.length === 0) {
        const fallback = await supabase.from('games').select('*').limit(6);
        gamesData = fallback.data;
      }

      if (gamesData) {
        popularGames = gamesData.map(g => ({
          ...g,
          image_url: fixUrl(g.image_url)
        }));
      }

      // Fetch Flash Sale Products
      const { data: flashSaleData } = await supabase
        .from('products')
        .select('*, games(name, slug, image_url)')
        .eq('is_flash_sale', true)
        .eq('active', true)
        .limit(10);

      if (flashSaleData) {
        flashSaleProducts = flashSaleData.map(p => ({
          id: p.id,
          gameSlug: p.games?.slug || '',
          gameName: p.games?.name || 'GAME',
          productName: p.name,
          image: fixUrl(p.games?.image_url) || '/placeholder.webp',
          originalPrice: p.original_price || p.price,
          discountPrice: p.price,
          stockRemaining: p.flash_sale_stock || 0,
        }));
      }

      // Fetch Categories (Only Active Ones)
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (catData) categories = catData;

      // Fetch All Games for Category Section
      const { data: allGamesData } = await supabase.from('games').select('*').order('created_at', { ascending: false });
      if (allGamesData) allGames = allGamesData;

      // Fetch Latest Articles
      const { data: articlesData } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      if (articlesData) articles = articlesData;

      // Fetch FAQs
      const { data: faqsData } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (faqsData) faqs = faqsData;

      // Fetch Payment Channels
      const { data: paymentsData } = await supabase
        .from('payment_channels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      if (paymentsData) paymentChannels = paymentsData;

      // Fetch Tenant Config based on domain
      let { data: tenantData } = await supabase.from('tenants').select('theme_config').eq('domain', domain).maybeSingle();

      // Fallback: If no exact domain match (e.g. testing on localhost:3000), fetch the first tenant's theme_config
      if (!tenantData) {
        const res = await supabase.from('tenants').select('theme_config').limit(1).maybeSingle();
        if (res.data) tenantData = res.data;
      }

      if (tenantData && tenantData.theme_config) {
        tenantConfig = tenantData.theme_config;
      }
    }
  } catch (err) {
    console.error("Supabase connection failed", err);
  }

  // Fallback to mock data if Supabase isn't connected or empty
  if (popularGames.length === 0) {
    popularGames = [
      { id: 1, name: "Mobile Legends", image_url: "/placeholder.webp", slug: "mobile-legends" },
      { id: 2, name: "Genshin Impact", image_url: "/placeholder.webp", slug: "genshin-impact" },
      { id: 3, name: "Valorant", image_url: "/placeholder.webp", slug: "valorant" },
      { id: 4, name: "PUBG Mobile", image_url: "/placeholder.webp", slug: "pubg-mobile" },
    ];
  }

  // Extract dynamic theme config or use default fallbacks
  const sliders = (tenantConfig.sliders && tenantConfig.sliders.length > 0)
    ? tenantConfig.sliders.map((s: string) => fixUrl(s))
    : [];

  const promoHeadline = tenantConfig.promoHeadline || "";
  const promoCode = tenantConfig.promoCode || "";
  const heroBackgroundUrl = fixUrl(tenantConfig.heroBackgroundUrl);

  const colors = tenantConfig.colors || {};
  const primaryColor = colors.primary ? hexToHsl(colors.primary) : null;
  const backgroundColor = colors.background ? hexToHsl(colors.background) : null;
  const cardColor = colors.card ? hexToHsl(colors.card) : null;
  const textColor = colors.text ? hexToHsl(colors.text) : null;

  return (
    <>
      <h1 className="sr-only">Home - {tenantConfig.seoTitle || "Gaming Store"}</h1>

      <style dangerouslySetInnerHTML={{
        __html: `
          :root, .dark {
            ${primaryColor ? `--primary: ${primaryColor};` : ''}
            ${primaryColor ? `--ring: ${primaryColor};` : ''}
            ${backgroundColor ? `--background: ${backgroundColor};` : ''}
            ${cardColor ? `--card: ${cardColor};` : ''}
            ${textColor ? `--foreground: ${textColor};` : ''}
            ${textColor ? `--card-foreground: ${textColor};` : ''}
            ${cardColor ? `--popover: ${cardColor};` : ''}
            ${textColor ? `--popover-foreground: ${textColor};` : ''}
            ${cardColor ? `--muted: ${cardColor};` : ''}
          }
        `
      }} />

      {/* Global Background Layer (Full Page) */}
      <div className="fixed inset-0 w-full h-full -z-20 pointer-events-none bg-background">
        {heroBackgroundUrl ? (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-30 blur-xl scale-105"
            style={{ backgroundImage: `url(${heroBackgroundUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-primary/10 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      </div>

      <div className="flex-1">
        {/* Immersive Hero Section */}
        <section
          className="relative w-full pt-8 pb-12 overflow-hidden"
        >
          {/* Content (Slider) */}
          <div className="container relative z-10 mx-auto px-4 group">
            <HeroSlider sliders={sliders} domain={domain} />
          </div>
        </section>

        {/* Flash Sale Section */}
        {flashSaleProducts.length > 0 && (
          <section className="container mx-auto px-4 -mt-4 relative z-20">
            <FlashSaleSection products={flashSaleProducts} />
          </section>
        )}

        {/* Promo Section */}
        {(promoHeadline || promoCode) && (
          <section className="container mx-auto px-4 py-2">
            <div className="rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-background px-6 py-6 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{promoHeadline}</h2>
                <p className="text-sm text-muted-foreground mt-1">Dapatkan diskon spesial untuk top-up pertamamu!</p>
              </div>
              {promoCode && (
                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-sm text-muted-foreground">Gunakan Kode:</span>
                  <span className="font-bold text-primary tracking-wider text-lg">{promoCode}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Popular Games Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">🔥</span>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">POPULER!</h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">Beberapa produk yang paling populer saat ini.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {popularGames.map((game: any) => (
              <Link href={`/game/${game.slug || 'unknown'}`} key={game.id}>
                <div className="relative overflow-hidden bg-card rounded-2xl border border-border/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer group h-[116px] flex flex-col justify-between">

                  {/* Card Main Content Area */}
                  <div className="relative flex-1 flex items-center p-3 overflow-hidden">
                    {/* Background Image / Watermark on the right */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-[70%] opacity-40 group-hover:opacity-70 transition-opacity duration-300 bg-cover bg-left bg-no-repeat"
                      style={{ backgroundImage: game.background_image ? `url(${fixUrl(game.background_image)})` : 'none' }}
                    />

                    {/* Gradient to fade out background on the left side so text is readable */}
                    <div className="absolute inset-0 bg-gradient-to-r from-card via-card/95 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 flex items-center gap-4 w-full h-full">
                      {/* Game Thumbnail */}
                      <div className="relative w-[80px] h-[80px] rounded-[18px] overflow-hidden shrink-0 shadow-md bg-muted/50 border border-border/30">
                        {game.image_url ? (
                          <Image src={fixUrl(game.image_url)} alt={game.name} fill sizes="80px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-medium">Cover</div>
                        )}
                      </div>

                      {/* Text Data */}
                      <div className="flex flex-col flex-1 min-w-0 justify-center">
                        <h3 className="font-bold text-card-foreground text-[15px] leading-snug truncate group-hover:text-primary transition-colors drop-shadow-md">
                          {game.name}
                        </h3>
                        <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                          {game.developer || "Developer"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Decorative Strip */}
                  <div className="relative h-[12px] w-full bg-muted border-t-2 border-primary/60 flex-shrink-0">
                    {/* CSS Pattern to simulate ornate border */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `radial-gradient(circle at 10px 6px, transparent 4px, currentColor 4px, currentColor 5px, transparent 5px)`,
                        backgroundSize: '20px 12px'
                      }}
                    />
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `radial-gradient(circle at 0px 6px, transparent 4px, currentColor 4px, currentColor 5px, transparent 5px)`,
                        backgroundSize: '20px 12px'
                      }}
                    />
                  </div>

                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && allGames.length > 0 && (
          <section className="container mx-auto px-4 py-8 relative z-20">
            <CategorySection categories={categories} games={allGames} />
          </section>
        )}

        {/* Latest Articles Section */}
        {articles.length > 0 && (
          <section className="container mx-auto px-4 py-12 relative z-20">
            <LatestArticlesSection articles={articles} />
          </section>
        )}

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <section className="container mx-auto px-4 pb-12 md:pb-20 relative z-20">
            <FaqSection faqs={faqs} />
          </section>
        )}

      </div>
    </>
  );
}
