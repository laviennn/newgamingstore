"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Clock, ShieldCheck, ChevronRight } from "lucide-react";
import { getDictionary, Language } from "@/lib/dictionary";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Footer({ domain, themeConfig, paymentChannels, language }: { domain: string, themeConfig: any, paymentChannels: any[], language?: Language }) {
  
  const fixUrl = (url: string | null) => {
    if (!url) return '';
    return url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com');
  };

  const {
    seoTitle,
    seoDescription,
    whatsapp,
    instagram,
    tiktok,
    youtube,
    email,
    operationalHours,
    waDefaultMessage,
    footerBannerUrl,
    logoUrl
  } = themeConfig;

  const activeLanguage = language || themeConfig?.language || "id";
  const dict = getDictionary(activeLanguage);

  const displayTitle = seoTitle || domain;
  const displayDesc = seoDescription || dict.footer_desc;

  const cleanWa = whatsapp ? whatsapp.replace(/[^0-9]/g, "") : "";
  const waUrl = cleanWa 
    ? `https://wa.me/${cleanWa}${waDefaultMessage ? `?text=${encodeURIComponent(waDefaultMessage)}` : ''}` 
    : '#';

  return (
    <footer className="w-full bg-background border-t border-border relative z-10 mt-0">
      
      {/* Full Width Banner Area (Edge-to-edge) */}
      {footerBannerUrl && (
        <div 
          className="w-full relative h-[160px] sm:h-[220px] md:h-[300px] lg:h-[360px] min-h-[140px] overflow-hidden border-b border-border/40 bg-card"
        >
           <Image 
             src={fixUrl(footerBannerUrl)} 
             alt="Footer Banner" 
             fill 
             sizes="100vw"
             className="object-cover object-center w-full h-full"
             priority
           />
           {/* Gentle bottom shadow blend */}
           <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Main Footer Content with dynamic top padding */}
      <div className={`container mx-auto px-4 ${footerBannerUrl ? 'pt-10 md:pt-14' : 'pt-16 md:pt-20 lg:pt-24'} pb-14 md:pb-20`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Column 1: Brand & Payments */}
          <div className="md:col-span-4 space-y-6">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{displayTitle}</h2>
            
            <p className="text-sm text-muted-foreground leading-relaxed pr-4">
              {displayDesc}
            </p>

            <div className="pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-4">{dict.footer_payment_title}</h3>
              <div className="flex flex-wrap gap-2">
                {paymentChannels.slice(0, 5).map((p) => (
                  <div key={p.id} className="bg-white rounded px-2 py-1 h-8 w-[60px] flex items-center justify-center relative overflow-hidden">
                    {p.logo_url ? (
                       <Image src={fixUrl(p.logo_url)} alt={p.name} fill sizes="60px" className="object-contain p-1" />
                    ) : (
                       <span className="text-[10px] text-black font-bold">{p.name}</span>
                    )}
                  </div>
                ))}
                {paymentChannels.length > 5 && (
                  <div className="h-8 flex items-center justify-center px-2 text-xs text-primary font-semibold">
                    +{paymentChannels.length - 5} {dict.footer_payment_more}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Assistance & Guarantee */}
          <div className="md:col-span-3 space-y-6">
            <h3 className="text-sm font-semibold text-foreground">{dict.footer_help_title}</h3>
            <a 
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full bg-card hover:bg-card/80 border border-border rounded-xl px-4 py-3 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                </div>
                <span className="text-sm font-semibold text-foreground">{dict.footer_wa_btn}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-foreground transition-colors" />
            </a>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Clock className="w-4 h-4 text-primary" />
                <span>{dict.footer_hours_label} {operationalHours || "08:00 - 23:00 WIB"}</span>
              </div>
              {email && (
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{email}</span>
                </div>
              )}
            </div>

            <div className="pt-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">{dict.footer_guarantee_title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{dict.footer_guarantee_desc}</p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mt-2">
                <ShieldCheck className="w-4 h-4" /> {dict.footer_security_badge}
              </div>
            </div>
          </div>

          {/* Column 3: Navigation Menu (Hidden on mobile to keep footer compact and clean) */}
          <div className="hidden md:block md:col-span-2 space-y-6">
            <h3 className="text-sm font-semibold text-foreground">Menu</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/track" className="hover:text-primary transition-colors">{dict.nav_check_invoice}</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/prices" className="hover:text-primary transition-colors">{dict.nav_price_list}</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">{dict.nav_blog}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">{dict.footer_terms}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">{dict.footer_privacy}</Link></li>
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div className="md:col-span-3 space-y-6 flex flex-col items-start md:items-end text-left md:text-right">
            <div className="w-full">
               <h3 className="text-sm font-semibold text-foreground md:text-right mb-6">{dict.footer_social_title}</h3>
               <div className="flex gap-4 md:justify-end">
                 {instagram && (
                   <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 transition-all group">
                     <svg className="w-5 h-5 text-slate-400 group-hover:text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                   </a>
                 )}
                 {tiktok && (
                   <a href={tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-black transition-all group">
                     <svg className="w-5 h-5 text-slate-400 group-hover:text-foreground" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.63-.3 3.29-1.22 4.67-1.12 1.67-2.91 2.79-4.89 3.03-1.95.24-4.04-.13-5.65-1.34-1.62-1.21-2.61-3.09-2.73-5.1-.13-2.06.66-4.14 2.15-5.51 1.48-1.37 3.52-2.03 5.51-1.73v4.06c-1.34-.1-2.72.33-3.6 1.25-.87.9-1.18 2.21-.86 3.42.33 1.21 1.34 2.19 2.55 2.51 1.21.32 2.55.03 3.52-.75.98-.8 1.52-2.05 1.52-3.32V.02z"/>
                     </svg>
                   </a>
                 )}
                 {youtube && (
                   <a href={youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-red-600 transition-all group">
                     <svg className="w-5 h-5 text-slate-400 group-hover:text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                   </a>
                 )}
               </div>
            </div>

            <div className="pt-6 flex flex-col items-start md:items-end gap-3">
               {/* Flag & Currency Badge on Mobile (right above Guarded by Security) */}
               <div className="md:hidden inline-flex">
                 <div className="bg-card text-foreground border border-border px-3.5 py-2 rounded-full flex items-center gap-2 shadow-sm">
                   <span className="text-base leading-none">
                      {language === 'ms' ? '🇲🇾' : '🇮🇩'}
                   </span>
                   <span className="text-xs font-semibold">{dict.footer_country_badge}</span>
                 </div>
               </div>

               <div className="bg-card/50 border border-border rounded-full px-4 py-2 flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-emerald-400" />
                 <span className="text-xs font-semibold text-foreground/80">Guarded by <span className="text-foreground">Security</span></span>
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar (Added pb-20 on mobile so text is never obscured by fixed MobileBottomBar) */}
      <div className="border-t border-border bg-background pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs text-slate-500">
            Copyright © {new Date().getFullYear()} <span className="font-bold text-muted-foreground">{displayTitle}</span>. {dict.footer_copyright}
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 sm:gap-6 text-xs font-semibold">
            <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">{dict.footer_terms}</Link>
            <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">{dict.footer_privacy}</Link>
            
            <div className="bg-card text-foreground border border-border px-3 py-1.5 rounded-full flex items-center gap-2 cursor-pointer hover:bg-card/80 transition-colors shadow-sm">
              <span className="text-base leading-none">
                 {language === 'ms' ? '🇲🇾' : '🇮🇩'}
              </span>
              <span>{dict.footer_country_badge}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
