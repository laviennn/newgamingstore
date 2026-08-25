import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export const revalidate = 3600; // 1-hour ISR cache on Edge CDN
import Link from 'next/link';
import { DynamicFieldBuilder } from '@/components/storefront/DynamicFieldBuilder';
import { GameDescriptionAccordion } from '@/components/storefront/GameDescriptionAccordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Zap,
  HeadphonesIcon,
  ShieldCheck,
} from 'lucide-react';
import { StorefrontGameForm } from '@/components/storefront/StorefrontGameForm';
import { getDictionary, type Language } from '@/lib/dictionary';

import { cookies } from 'next/headers';
import { type Currency, getLanguageFromCurrency } from '@/lib/currencyUtils';

export default async function GameTopUpPage({
  params,
}: {
  params: Promise<{ slug: string; domain: string }>;
}) {
  const { slug, domain } = await params;
  const cookieStore = await cookies();
  const supabase = await createClient();

  // 1. Fetch Global Banner from Tenant First
  const hostname = decodeURIComponent(domain).split(':')[0]; // remove port if exists
  let { data: tenant } = await supabase
    .from('tenants')
    .select('id, theme_config')
    .eq('domain', hostname)
    .maybeSingle();

  if (!tenant) {
    // fallback if no domain exact match
    const { data: fallbackTenant } = await supabase
      .from('tenants')
      .select('id, theme_config')
      .limit(1)
      .maybeSingle();
    tenant = fallbackTenant;
  }

  if (!tenant) {
    return notFound();
  }

  let gameDetailBanner = '';

  if (tenant?.theme_config?.gameDetailBanner) {
    gameDetailBanner = tenant.theme_config.gameDetailBanner;
  }

  // Resolve Active Currency
  const themeConfig = tenant?.theme_config || {};
  const userCurrencyCookie = cookieStore.get('storefront_currency')?.value as Currency | undefined;
  const supportedCurrencies: Currency[] = Array.isArray(themeConfig?.supported_currencies) && themeConfig.supported_currencies.length > 0
    ? themeConfig.supported_currencies
    : (themeConfig?.currency ? [themeConfig.currency as Currency] : [themeConfig?.language === 'ms' ? 'MYR' : 'IDR']);
  const defaultCurrency: Currency = (themeConfig?.default_currency as Currency) || (themeConfig?.currency as Currency) || (themeConfig?.language === 'ms' ? 'MYR' : 'IDR') || supportedCurrencies[0] || 'IDR';
  const activeCurrency: Currency = (userCurrencyCookie && supportedCurrencies.includes(userCurrencyCookie)) ? userCurrencyCookie : defaultCurrency;

  // 2. Fetch Game
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*, categories(name)')
    .eq('slug', slug)
    .eq('tenant_id', tenant.id)
    .single();

  if (gameError || !game) {
    return notFound();
  }

  // 3. Fetch Products from Database
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('game_id', game.id)
    .eq('tenant_id', tenant.id)
    .eq('active', true)
    .order('price', { ascending: true });

  const displayProducts = products || [];

  // 4. Fetch Payment Channels & Filter by Active Currency
  const { data: channels } = await supabase
    .from('payment_channels')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true);
    
  const paymentChannels = (channels || []).filter((pc: any) => {
    if (!pc.supported_currencies || !Array.isArray(pc.supported_currencies) || pc.supported_currencies.length === 0) return true;
    return pc.supported_currencies.includes(activeCurrency);
  });

  const language: Language = userCurrencyCookie
    ? getLanguageFromCurrency(activeCurrency)
    : (themeConfig?.language || getLanguageFromCurrency(activeCurrency) || 'id');
  const dict = getDictionary(language);

  return (
    <div className='min-h-screen pb-20'>
      {/* Top Banner (Full Width) */}
      {gameDetailBanner && (
        <div className='relative w-full h-[320px] lg:h-[460px]'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gameDetailBanner}
            alt={game.name}
            className='w-full h-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent' />
        </div>
      )}

      <div className='container mx-auto px-4 -mt-16 lg:-mt-24 relative z-10 max-w-6xl'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* LEFT COLUMN: Game Details */}
          <div className='lg:col-span-1 space-y-4'>
            <div className='bg-theme-card border border-border/40 rounded-xl p-4 shadow-xl backdrop-blur-md'>
              <div className='flex gap-4 items-start'>
                <div className='relative w-20 h-28 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-md'>
                  {game.image_url ? (
                    <Image
                      src={game.image_url}
                      alt={game.name}
                      fill
                      sizes='80px'
                      className='object-cover'
                    />
                  ) : (
                    <div className='w-full h-full bg-muted flex items-center justify-center text-xs'>
                      No Cover
                    </div>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <h1 className='text-xl font-bold leading-tight line-clamp-2 text-white'>
                    {game.name}
                  </h1>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {game.developer || game.categories?.name || 'Developer'}
                  </p>

                  {/* Badges */}
                  <div className='flex flex-col gap-2 mt-4'>
                    <div className='inline-flex items-center text-[11px] font-bold bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30 w-fit backdrop-blur-sm'>
                      <Zap className='w-3.5 h-3.5 mr-1.5' /> {dict.game_fast_process}
                    </div>
                    <div className='inline-flex items-center text-[11px] font-bold bg-[var(--accent-glow)] text-theme-primary opacity-90 px-3 py-1.5 rounded-full border border-theme-primary/30 w-fit backdrop-blur-sm'>
                      <HeadphonesIcon className='w-3.5 h-3.5 mr-1.5' /> {dict.game_chat_support}
                    </div>
                    <div className='inline-flex items-center text-[11px] font-bold bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-full border border-purple-500/30 w-fit backdrop-blur-sm'>
                      <ShieldCheck className='w-3.5 h-3.5 mr-1.5' /> {dict.game_official_product}
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordion Deskripsi */}
              {game.topup_instructions && (
                <GameDescriptionAccordion description={game.topup_instructions} language={language} />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Form */}
          <div className='lg:col-span-2'>
            <StorefrontGameForm
              game={game}
              products={displayProducts}
              paymentChannels={paymentChannels}
              themeConfig={{ ...themeConfig, language }}
              currency={activeCurrency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
