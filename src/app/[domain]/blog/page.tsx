import { createClient } from "@/utils/supabase/server";
import { LatestArticlesSection } from "@/components/storefront/LatestArticlesSection";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const revalidate = 3600; // 1-hour ISR cache on Edge CDN

export default async function BlogPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let articles: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();

      // Fetch Tenant Config based on domain
      let { data: tenantData } = await supabase.from('tenants').select('id').eq('domain', domain).maybeSingle();
      if (!tenantData) {
        const res = await supabase.from('tenants').select('id').limit(1).maybeSingle();
        if (res.data) tenantData = res.data;
      }

      const tenantId = tenantData?.id;

      if (tenantId) {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("tenant_id", tenantId)
          .eq("is_published", true)
          .order("created_at", { ascending: false });
          
        if (!error && data) articles = data;
      }
    }
  } catch (err) {
    console.error("Gagal mengambil data artikel", err);
  }

  return (
    <div className="container mx-auto px-4 py-12 relative z-10 flex-1">
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
    </div>
  );
}
