import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { SnowfallEffect } from '@/components/storefront/SnowfallEffect';
import { FloatingWhatsapp } from '@/components/storefront/FloatingWhatsapp';
import { MobileBottomBar } from '@/components/storefront/MobileBottomBar';
import {
  PurchaseNotification,
  type NotificationItem,
} from '@/components/storefront/PurchaseNotification';
import { MaintenanceView } from '@/components/storefront/MaintenanceView';
import {
  getTenantAuthConfig,
  getStorefrontSession,
  type AuthMode,
} from '@/lib/tenantAuth';
import type { MemberPayload } from '@/utils/memberSession';
import { generateThemeCssVariables } from '@/lib/themeUtils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    const targetDomain = domain === 'demo.localhost' ? 'localhost' : domain;

    let { data: tenantData } = await supabase
      .from('tenants')
      .select('theme_config, name')
      .eq('domain', targetDomain)
      .maybeSingle();

    if (!tenantData && targetDomain.includes('localhost')) {
      const { data: localTenant } = await supabase
        .from('tenants')
        .select('theme_config, name')
        .eq('domain', 'localhost')
        .maybeSingle();
      if (localTenant) tenantData = localTenant;
    }

    if (!tenantData) {
      const res = await supabase
        .from('tenants')
        .select('theme_config, name')
        .limit(1)
        .maybeSingle();
      if (res.data) tenantData = res.data;
    }

    if (tenantData && tenantData.theme_config) {
      const config = tenantData.theme_config;
      return {
        title: config.seoTitle || tenantData.name,
        description:
          config.seoDescription ||
          `Top up game murah dan cepat di ${tenantData.name}`,
        keywords: config.seoKeywords
          ? config.seoKeywords.split(',').map((k: string) => k.trim())
          : [],
        icons: {
          icon: config.logoUrl || '/favicon.ico',
          shortcut: config.logoUrl || '/favicon.ico',
          apple: config.logoUrl || '/favicon.ico',
        },
        openGraph: {
          title: config.seoTitle || tenantData.name,
          description:
            config.seoDescription ||
            `Top up game murah dan cepat di ${tenantData.name}`,
          images: config.ogImage
            ? [{ url: config.ogImage }]
            : config.logoUrl
              ? [{ url: config.logoUrl }]
              : [],
        },
        twitter: {
          card: 'summary_large_image',
          title: config.seoTitle || tenantData.name,
          description:
            config.seoDescription ||
            `Top up game murah dan cepat di ${tenantData.name}`,
          images: config.ogImage
            ? [config.ogImage]
            : config.logoUrl
              ? [config.logoUrl]
              : [],
        },
      };
    }
  }

  return {
    title: domain,
    description: 'Gaming Store',
  };
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const cookieStore = await cookies();
  const isMaintenanceBypassed =
    cookieStore.get('bypass_maintenance')?.value === 'true';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let paymentChannels: any[] = [];
  const purchaseNotifications: NotificationItem[] = [];

  let user = null;
  let memberSession: (MemberPayload & { phone?: string | null }) | null = null;
  let authMode: AuthMode = 'email';
  let currentTenantName = 'Yowanastore';
  let isMaintenanceActive = false;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    const tenantAuthConfig = await getTenantAuthConfig(domain);
    authMode = tenantAuthConfig?.authMode || 'email';

    const session = await getStorefrontSession(domain);
    if (session?.type === 'email') {
      user = session.user;
    } else if (session?.type === 'username') {
      memberSession = session.member;
    }

    // Override user level dynamically based on latest successful UPGRADE deposit
    if (user && user.email) {
      const { data: upgradeHistory } = await supabase
        .from('deposits')
        .select('metadata')
        .eq('customer_email', user.email.toLowerCase())
        .eq('status', 'Success')
        .order('created_at', { ascending: false })
        .limit(20); // fetch some to ensure we get UPGRADE type

      if (upgradeHistory && upgradeHistory.length > 0) {
        const latestUpgrade = upgradeHistory.find(
          (d) => d.metadata && d.metadata.type === 'UPGRADE',
        );
        if (latestUpgrade && latestUpgrade.metadata.package_name) {
          if (!user.user_metadata) user.user_metadata = {};
          user.user_metadata.level = latestUpgrade.metadata.package_name;
        }
      }
    }

    const targetDomain = domain === 'demo.localhost' ? 'localhost' : domain;

    let { data: tenantData } = await supabase
      .from('tenants')
      .select('id, theme_config, name, is_maintenance')
      .eq('domain', targetDomain)
      .maybeSingle();

    if (!tenantData && targetDomain.includes('localhost')) {
      const { data: localTenant } = await supabase
        .from('tenants')
        .select('id, theme_config, name, is_maintenance')
        .eq('domain', 'localhost')
        .maybeSingle();
      if (localTenant) tenantData = localTenant;
    }

    if (!tenantData) {
      const res = await supabase
        .from('tenants')
        .select('id, theme_config, name, is_maintenance')
        .limit(1)
        .maybeSingle();
      if (res.data) tenantData = res.data;
    }

    if (tenantData) {
      isMaintenanceActive = !!tenantData.is_maintenance;
      const isAdminUser =
        user?.user_metadata?.role === 'admin' ||
        user?.app_metadata?.role === 'admin';

      if (isMaintenanceActive && !isMaintenanceBypassed && !isAdminUser) {
        return (
          <MaintenanceView tenantName={tenantData.name || 'Yowanastore'} />
        );
      }

      if (tenantData.theme_config) {
        config = tenantData.theme_config;
      }
      currentTenantName = tenantData.name || 'Yowanastore';
    }

    if (tenantData?.id) {
      const [{ data: channels }, { data: productsData }] = await Promise.all([
        supabase
          .from('payment_channels')
          .select('*')
          .eq('tenant_id', tenantData.id)
          .eq('is_active', true),
        supabase
          .from('products')
          .select('name, games(name, image_url)')
          .eq('tenant_id', tenantData.id)
          .eq('active', true),
      ]);

      paymentChannels = channels || [];

      // Build real purchase notifications: max 4 products per game
      if (productsData) {
        // Group products by game name
        const gameMap = new Map<
          string,
          { gameName: string; gameImage: string; products: string[] }
        >();

        for (const product of productsData) {
          const gameRaw = product.games as unknown;
          const game = Array.isArray(gameRaw)
            ? (gameRaw[0] as { name: string; image_url: string } | undefined)
            : (gameRaw as { name: string; image_url: string } | null);
          if (!game || !game.image_url) continue;

          const key = game.name;
          if (!gameMap.has(key)) {
            gameMap.set(key, {
              gameName: game.name,
              gameImage: game.image_url,
              products: [],
            });
          }
          gameMap.get(key)!.products.push(product.name);
        }

        // For each game, shuffle and take max 4 products
        for (const entry of gameMap.values()) {
          const selected = getShuffledProducts(entry.products).slice(0, 4);
          for (const itemName of selected) {
            purchaseNotifications.push({
              gameName: entry.gameName,
              gameImage: entry.gameImage,
              itemName,
            });
          }
        }
      }
    }
  }

  const customStyle = generateThemeCssVariables(config);

  return (
    <>
      <div className='flex min-h-screen flex-col bg-background text-foreground font-sans'>
        <style dangerouslySetInnerHTML={{ __html: customStyle }} />
        <SnowfallEffect />

        {isMaintenanceActive && (
          <div className='bg-amber-500/20 border-b border-amber-500/40 text-amber-300 text-xs md:text-sm py-2 px-4 text-center font-semibold flex items-center justify-center gap-2 z-50 relative backdrop-blur-md'>
            <span>
              ⚠️ <strong>Mode Maintenance Aktif</strong> — Anda sedang mengakses
              versi pratinjau (Developer/Admin Bypass).
            </span>
            <a
              href='?bypass_maintenance=false'
              className='underline hover:text-white ml-2 text-[11px] bg-amber-500/30 px-2 py-0.5 rounded transition-colors'>
              Matikan Pratinjau
            </a>
          </div>
        )}

        <Header
          logoUrl={config.logoUrl || ''}
          domain={domain}
          user={user}
          memberSession={memberSession}
          authMode={authMode}
          language={config.language || 'id'}
        />

        <main className='flex-1'>{children}</main>

        <Footer
          domain={domain}
          themeConfig={config}
          paymentChannels={paymentChannels}
        />

        <FloatingWhatsapp
          whatsapp={config.whatsapp}
          active={config.waFloatingActive ?? true}
          avatarUrl={config.waFloatingAvatarUrl}
          text={config.waFloatingText}
          customMessage={config.waDefaultMessage}
        />
        <MobileBottomBar
          waChannelActive={config.waChannelActive ?? false}
          waChannelUrl={config.waChannelUrl || '#'}
        />

        <PurchaseNotification
          tenantName={currentTenantName}
          notifications={purchaseNotifications}
        />
      </div>

      {config.gtmId && <GoogleTagManager gtmId={config.gtmId} />}
      {config.ga4Id && <GoogleAnalytics gaId={config.ga4Id} />}
    </>
  );
}

function getShuffledProducts(products: string[]): string[] {
  return [...products].sort(() => Math.random() - 0.5);
}
