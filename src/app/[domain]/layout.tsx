import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import React from "react";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { SnowfallEffect } from "@/components/storefront/SnowfallEffect";
import { FloatingWhatsapp } from "@/components/storefront/FloatingWhatsapp";
import { MobileBottomBar } from "@/components/storefront/MobileBottomBar";
import { PurchaseNotification } from "@/components/storefront/PurchaseNotification";
import { hexToHsl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    let { data: tenantData } = await supabase.from('tenants').select('theme_config, name').eq('domain', domain).maybeSingle();

    if (!tenantData) {
      const res = await supabase.from('tenants').select('theme_config, name').limit(1).maybeSingle();
      if (res.data) tenantData = res.data;
    }

    if (tenantData && tenantData.theme_config) {
      const config = tenantData.theme_config;
      return {
        title: config.seoTitle || tenantData.name,
        description: config.seoDescription || `Top up game murah dan cepat di ${tenantData.name}`,
        keywords: config.seoKeywords ? config.seoKeywords.split(',').map((k: string) => k.trim()) : [],
        icons: {
          icon: config.logoUrl || '/favicon.ico',
          shortcut: config.logoUrl || '/favicon.ico',
          apple: config.logoUrl || '/favicon.ico',
        },
        openGraph: {
          title: config.seoTitle || tenantData.name,
          description: config.seoDescription || `Top up game murah dan cepat di ${tenantData.name}`,
          images: config.ogImage ? [{ url: config.ogImage }] : (config.logoUrl ? [{ url: config.logoUrl }] : []),
        },
        twitter: {
          card: 'summary_large_image',
          title: config.seoTitle || tenantData.name,
          description: config.seoDescription || `Top up game murah dan cepat di ${tenantData.name}`,
          images: config.ogImage ? [config.ogImage] : (config.logoUrl ? [config.logoUrl] : []),
        },
        verification: {
          google: config.gscVerification || undefined,
        }
      }
    }
  }

  return {
    title: domain,
    description: "Gaming Store",
  };
}

export default async function StorefrontLayout({ children, params }: { children: React.ReactNode, params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let paymentChannels: any[] = [];
  
  let user = null;
  let currentTenantName = "Yowanastore";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    
    // Get Current User
    const { data: authData } = await supabase.auth.getUser();
    user = authData.user;
    
    // Override user level dynamically based on latest successful UPGRADE deposit
    if (user && user.email) {
      const { data: upgradeHistory } = await supabase
        .from("deposits")
        .select("metadata")
        .eq("customer_email", user.email.toLowerCase())
        .eq("status", "Success")
        .order("created_at", { ascending: false })
        .limit(20); // fetch some to ensure we get UPGRADE type
      
      if (upgradeHistory && upgradeHistory.length > 0) {
        const latestUpgrade = upgradeHistory.find(d => d.metadata && d.metadata.type === "UPGRADE");
        if (latestUpgrade && latestUpgrade.metadata.package_name) {
          if (!user.user_metadata) user.user_metadata = {};
          user.user_metadata.level = latestUpgrade.metadata.package_name;
        }
      }
    }

    let { data: tenantData } = await supabase.from('tenants').select('theme_config, name').eq('domain', domain).maybeSingle();

    if (!tenantData) {
      const res = await supabase.from('tenants').select('theme_config, name').limit(1).maybeSingle();
      if (res.data) tenantData = res.data;
    }

    if (tenantData) {
      if (tenantData.theme_config) {
        config = tenantData.theme_config;
      }
      currentTenantName = tenantData.name || "Yowanastore";
    }

    const { data: channels } = await supabase.from('payment_channels').select('*').eq('is_active', true);
    paymentChannels = channels || [];
  }

  let customStyle = "";
  if (config.primaryColor) {
    const hsl = hexToHsl(config.primaryColor);
    if (hsl) {
      customStyle = `
        :root {
          --primary: ${hsl};
        }
      `;
    }
  }

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
        <style dangerouslySetInnerHTML={{ __html: customStyle }} />
        <SnowfallEffect />
        
        <Header logoUrl={config.logoUrl || ""} domain={domain} user={user} />
        
        <main className="flex-1">
          {children}
        </main>
        
        <Footer domain={domain} themeConfig={config} paymentChannels={paymentChannels} />
        
        <FloatingWhatsapp 
          whatsapp={config.whatsapp} 
          active={config.waFloatingActive ?? true} 
          avatarUrl={config.waFloatingAvatarUrl} 
          text={config.waFloatingText} 
          customMessage={config.waDefaultMessage}
        />
        
        <MobileBottomBar />
        
        <PurchaseNotification tenantName={currentTenantName} />
      </div>

      {config.gtmId && <GoogleTagManager gtmId={config.gtmId} />}
      {config.ga4Id && <GoogleAnalytics gaId={config.ga4Id} />}
    </>
  );
}
