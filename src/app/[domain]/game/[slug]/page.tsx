import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
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
import { getDictionary } from '@/lib/dictionary';

export default async function GameTopUpPage({
  params,
}: {
  params: Promise<{ slug: string; domain: string }>;
}) {
  const { slug, domain } = await params;
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
    .order('price', { ascending: true });

  const displayProducts = products || [];

  // 4. Fetch Payment Channels
  const { data: channels } = await supabase
    .from('payment_channels')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true);
  const paymentChannels = channels || [];

  const language = tenant?.theme_config?.language || 'id';
  const dict = getDictionary(language);

  return (
    <div className='min-h-screen pb-20'>
      {/* Top Banner (Full Width) */}
      {gameDetailBanner && (
        <div className='relative w-full h-[320px] lg:h-[460px]'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gameDetailBanner}
            alt='Game Detail Banner'
            className='absolute inset-0 w-full h-full object-cover object-center'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent' />
        </div>
      )}

      <div
        className={`container mx-auto px-4 ${gameDetailBanner ? '-mt-12 lg:-mt-20' : 'pt-10'} relative z-10 max-w-7xl`}>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* LEFT COLUMN: Info */}
          <div className='lg:w-[35%] space-y-6'>
            {/* Poster & Title Card */}
            <div className='flex gap-5'>
              <div className='relative w-32 h-44 rounded-2xl overflow-hidden shadow-2xl border-[3px] border-border shrink-0 bg-muted'>
                <Image
                  src={
                    game.image_url ||
                    'https://assets.newgamingstore.com/placeholder.png'
                  }
                  alt={game.name}
                  fill
                  sizes='128px'
                  className='object-cover'
                />
              </div>
              <div className='pt-2 text-white flex flex-col justify-center'>
                <h1 className='text-2xl md:text-3xl font-extrabold uppercase drop-shadow-lg tracking-tight'>
                  {game.name}
                </h1>
                <p className='text-sm md:text-base opacity-90 drop-shadow-md font-medium mt-1 text-primary'>
                  {game.developer || 'Official Developer'}
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

          {/* RIGHT COLUMN: Form */}
          <StorefrontGameForm
            game={game}
            products={displayProducts}
            paymentChannels={paymentChannels}
            themeConfig={tenant?.theme_config || {}}
          />
        </div>
      </div>
    </div>
  );
}
