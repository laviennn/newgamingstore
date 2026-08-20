import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Calendar, User } from "lucide-react";

export const revalidate = 3600; // 1-hour ISR cache on Edge CDN

const fixUrl = (url: string | null) => {
  if (!url) return '';
  return url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com');
};

export default async function BlogDetail({ params }: { params: Promise<{ slug: string, domain: string }> }) {
  const { slug, domain } = await params;
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return notFound();
  
  const supabase = await createClient();

  let { data: tenantData } = await supabase.from('tenants').select('id').eq('domain', domain).maybeSingle();
  if (!tenantData) {
    const res = await supabase.from('tenants').select('id').limit(1).maybeSingle();
    if (res.data) tenantData = res.data;
  }
  
  if (!tenantData) {
     return notFound();
  }

  const tenantId = tenantData.id;

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("tenant_id", tenantId)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !article) {
    return notFound();
  }

  return (
    <div className="relative min-h-screen">
      {/* Hero Background */}
      {article.image_url && (
        <div className="absolute top-0 inset-x-0 h-[60vh] w-full -z-10 overflow-hidden opacity-30 blur-2xl pointer-events-none">
          <Image src={fixUrl(article.image_url)} alt="Background" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050810]/80 to-[#050810]" />
        </div>
      )}

      <div className="container max-w-4xl mx-auto px-4 py-12 relative z-10 flex-1">
        <Link href="/blog" className="text-theme-primary opacity-90 hover:text-blue-300 transition-colors flex items-center gap-2 mb-8">
          <ChevronLeft className="w-5 h-5" /> Daftar Artikel
        </Link>
        
        <article className="bg-[#0c1222] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl">
          {/* Header Image */}
          {article.image_url && (
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
              <Image 
                src={fixUrl(article.image_url)} 
                alt={article.title} 
                fill 
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1222] to-transparent" />
            </div>
          )}

          {/* Article Header */}
          <div className="p-6 md:p-12 pb-0">
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-6">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-white/10 pb-8">
              <div className="flex items-center gap-2 text-yellow-400 font-medium">
                <User className="w-4 h-4" /> {article.author || "Admin"}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {new Date(article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div 
            className="p-6 md:p-12 prose prose-invert prose-blue max-w-none text-slate-300 leading-relaxed font-sans prose-headings:font-bold prose-headings:text-white prose-a:text-theme-primary opacity-90 hover:prose-a:text-blue-300"
            dangerouslySetInnerHTML={{ __html: article.content || "Tidak ada konten." }}
          />
        </article>
      </div>
    </div>
  );
}
