import { createClient } from "@/utils/supabase/server";
import { LatestArticlesSection } from "@/components/storefront/LatestArticlesSection";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { FloatingWhatsapp } from "@/components/storefront/FloatingWhatsapp";
import { MobileBottomBar } from "@/components/storefront/MobileBottomBar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BlogPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let articles: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tenantConfig: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let paymentChannels: any[] = [];

  const fixUrl = (url: string | null) => {
    if (!url) return '';
    return url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com');
  };

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
        
      if (!error && data) articles = data;

      // Fetch Tenant Config based on domain
      let { data: tenantData } = await supabase.from('tenants').select('theme_config').eq('domain', domain).maybeSingle();
      if (!tenantData) {
        const res = await supabase.from('tenants').select('theme_config').limit(1).maybeSingle();
        if (res.data) tenantData = res.data;
      }
      if (tenantData && tenantData.theme_config) tenantConfig = tenantData.theme_config;

      // Fetch Payment Channels
      const { data: paymentsData } = await supabase
        .from('payment_channels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      if (paymentsData) paymentChannels = paymentsData;
    }
  } catch (err) {
    console.error("Gagal mengambil data artikel", err);
  }

  const logoUrl = tenantConfig.logoUrl ? fixUrl(tenantConfig.logoUrl) : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#050810] text-foreground">
      <Header logoUrl={logoUrl} domain={domain} />

      <main className="container mx-auto px-4 py-12 relative z-10 flex-1">
        <div className="mb-10 flex items-center">
          <Link href="/" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
            <ChevronLeft className="w-5 h-5" /> Kembali ke Beranda
          </Link>
        </div>
        
        {articles.length > 0 ? (
           <LatestArticlesSection articles={articles} />
        ) : (
           <div className="text-center py-20 text-slate-400 bg-card rounded-2xl border border-white/10">
              Belum ada artikel yang dipublikasikan.
           </div>
        )}
      </main>

      <Footer domain={domain} themeConfig={tenantConfig || {}} paymentChannels={paymentChannels} />

      <FloatingWhatsapp 
        whatsapp={tenantConfig.whatsapp} 
        active={tenantConfig.waFloatingActive ?? true} 
        avatarUrl={tenantConfig.waFloatingAvatarUrl} 
        text={tenantConfig.waFloatingText} 
        customMessage={tenantConfig.waDefaultMessage}
      />
      <MobileBottomBar 
          waChannelActive={tenantConfig.waChannelActive ?? false}
          waChannelUrl={tenantConfig.waChannelUrl || "#"}
      />
    </div>
  );
}
