"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Save, Loader2, AlertCircle, UploadCloud } from "lucide-react";
import { useNotification } from "@/components/ui/notification";
import { createClient } from "@/utils/supabase/client";
import { uploadFile } from "@/app/actions/upload";
import Image from "next/image";

export default function ContentClient() {

  const { showNotification, NotificationComponent } = useNotification();
  const supabase = createClient();
  
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  
  // Tenant Context State
  const [tenantId, setTenantId] = React.useState<string | null>(null);
  const [tenantName, setTenantName] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  
  // State for homepage content
  const [logoUrl, setLogoUrl] = React.useState("");
  const [heroBackgroundUrl, setHeroBackgroundUrl] = React.useState("");
  const [gameDetailBanner, setGameDetailBanner] = React.useState("");
  const [sliders, setSliders] = React.useState<string[]>([""]);
  const [promoHeadline, setPromoHeadline] = React.useState("");
  const [promoCode, setPromoCode] = React.useState("");
  
  // Advanced SEO & Tracking State
  const [seoTitle, setSeoTitle] = React.useState("");
  const [seoDescription, setSeoDescription] = React.useState("");
  const [seoKeywords, setSeoKeywords] = React.useState("");
  const [ogImage, setOgImage] = React.useState("");
  const [gscVerification, setGscVerification] = React.useState("");
  const [gtmId, setGtmId] = React.useState("");
  const [ga4Id, setGa4Id] = React.useState("");
  
  const [uploadingOgImage, setUploadingOgImage] = React.useState(false);

  // Detect domain and load tenant
  React.useEffect(() => {
    async function detectAndLoadTenant() {
      try {
        const hostname = window.location.hostname;
        
        // Try to match exact admin_domain first
        const { data: exactData, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('admin_domain', hostname)
          .maybeSingle();
        
        let data = exactData;
        
        // Fallback: If no exact match (e.g. dev on localhost or admin.localhost), fetch the first tenant
        if (!data && !error) {
          const res = await supabase.from('tenants').select('*').limit(1).maybeSingle();
          data = res.data;
        }
        
        if (error) throw error;
        
        if (data) {
           setTenantId(data.id);
           setTenantName(data.name);
           
           const config = data.theme_config || {};
           setTimeout(() => {
             setLogoUrl(config.logoUrl || "");
             setHeroBackgroundUrl(config.heroBackgroundUrl || "");
             setGameDetailBanner(config.gameDetailBanner || "");
             setSliders(config.sliders && config.sliders.length > 0 ? config.sliders : [""]);
             setPromoHeadline(config.promoHeadline || "");
             setPromoCode(config.promoCode || "");
             
             // Load SEO & Tracking
             setSeoTitle(config.seoTitle || "");
             setSeoDescription(config.seoDescription || "");
             setSeoKeywords(config.seoKeywords || "");
             setOgImage(config.ogImage || "");
             setGscVerification(config.gscVerification || "");
             setGtmId(config.gtmId || "");
             setGa4Id(config.ga4Id || "");
           }, 0);
        } else {
           setErrorMsg(`No tenants found in database. Please create a tenant first.`);
        }
      } catch (err) {
        console.error("Failed to load tenant context", err);
        setErrorMsg("Failed to load tenant context from database.");
      } finally {
        setLoading(false);
      }
    }
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      detectAndLoadTenant();
    } else {
      setTimeout(() => {
        setLoading(false);
        setErrorMsg("Database connection not configured.");
      }, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSlider = () => {
    setSliders([...sliders, ""]);
  };

  const handleRemoveSlider = (index: number) => {
    const newSliders = [...sliders];
    newSliders.splice(index, 1);
    setSliders(newSliders.length > 0 ? newSliders : [""]);
  };

  const handleSliderChange = (index: number, value: string) => {
    const newSliders = [...sliders];
    newSliders[index] = value;
    setSliders(newSliders);
  };
  
  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingOgImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFile(formData);
      
      if (result.error) {
        showNotification("error", "Upload Failed", result.error);
      } else if (result.url) {
        setOgImage(result.url);
        showNotification("success", "Uploaded", "Open Graph Image uploaded successfully.");
      }
    } catch (err) {
      showNotification("error", "Upload Failed", "Unexpected error during upload.");
    } finally {
      setUploadingOgImage(false);
    }
  };

  const handleSave = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !tenantId) return;

    setSaving(true);
    try {
      const updatedConfig = {
         logoUrl,
         heroBackgroundUrl,
         gameDetailBanner,
         sliders: sliders.filter(s => s.trim() !== ""),
         promoHeadline,
         promoCode,
         // SEO & Tracking
         seoTitle,
         seoDescription,
         seoKeywords,
         ogImage,
         gscVerification,
         gtmId,
         ga4Id
      };

      const { error } = await supabase
        .from('tenants')
        .update({ theme_config: updatedConfig })
        .eq('id', tenantId);

      if (error) throw error;
      
      showNotification("success", "Saved", "Configuration has been updated successfully.");
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      showNotification("error", "Save Failed", error.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center">Loading configuration...</div>;
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">{errorMsg}</h2>
        <p className="text-muted-foreground">Make sure you are accessing this dashboard via a registered admin domain.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {NotificationComponent}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Editing storefront for: <strong className="text-foreground">{tenantName}</strong></p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Global Branding</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
             <div className="space-y-2">
               <label className="text-sm font-medium">Store Logo URL</label>
               <Input 
                 placeholder="https://example.com/logo.png" 
                 value={logoUrl}
                 onChange={(e) => setLogoUrl(e.target.value)}
               />
               <p className="text-[11px] text-muted-foreground mt-1">Logo ini juga akan otomatis dijadikan <strong>Favicon</strong>. Sangat disarankan rasio 1:1 (persegi) agar terlihat rapi di tab browser.</p>
               <p className="text-xs text-muted-foreground">URL to your transparent PNG logo.</p>
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Hero Background URL</label>
               <Input 
                 placeholder="https://example.com/hero-bg.jpg" 
                 value={heroBackgroundUrl}
                 onChange={(e) => setHeroBackgroundUrl(e.target.value)}
               />
               <p className="text-xs text-muted-foreground">Background pattern or image behind the auto-slider.</p>
             </div>
             <div className="space-y-2 md:col-span-2">
               <label className="text-sm font-medium">Game Detail Banner URL</label>
               <Input 
                 placeholder="https://example.com/game-banner.jpg" 
                 value={gameDetailBanner}
                 onChange={(e) => setGameDetailBanner(e.target.value)}
               />
               <p className="text-xs text-muted-foreground">Banner header panjang yang digunakan pada semua halaman detail game.</p>
             </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle>Advanced SEO</CardTitle>
            <CardDescription>Configure how your storefront appears on search engines and social media.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">SEO Title</label>
                 <Input 
                   placeholder="NewGamingStore - Top Up Cepat dan Murah" 
                   value={seoTitle}
                   onChange={(e) => setSeoTitle(e.target.value)}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">SEO Keywords</label>
                 <Input 
                   placeholder="top up ml, diamond murah, valorant points" 
                   value={seoKeywords}
                   onChange={(e) => setSeoKeywords(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">Comma-separated keywords.</p>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">SEO Description</label>
                 <Textarea 
                   placeholder="Platform top up game termurah dan terpercaya di Indonesia..." 
                   value={seoDescription}
                   onChange={(e) => setSeoDescription(e.target.value)}
                   className="min-h-[100px]"
                 />
               </div>
             </div>
             
             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Open Graph Image (Social Media)</label>
                 <div className="flex items-center gap-4">
                   <label className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-muted/50">
                      {uploadingOgImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                      <span>{uploadingOgImage ? "Uploading..." : "Upload to R2"}</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleOgImageUpload}
                        disabled={uploadingOgImage}
                      />
                   </label>
                   <Input 
                     placeholder="Image URL..." 
                     value={ogImage}
                     onChange={(e) => setOgImage(e.target.value)}
                     className="flex-1"
                   />
                 </div>
                 {ogImage && (
                    <div className="mt-2 relative w-full h-[150px] rounded-lg overflow-hidden border bg-muted">
                      <Image src={ogImage} alt="OG Preview" fill sizes="400px" className="object-cover" />
                    </div>
                 )}
                 <p className="text-[11px] text-muted-foreground mt-1">Sangat disarankan ukuran <strong>1200 x 630 pixels</strong> agar gambar pratinjau (OG Image) tidak terpotong saat dibagikan ke WhatsApp, Facebook, dsb. Jika dibiarkan kosong, sistem akan menggunakan Logo sebagai gantinya.</p>
               </div>
             </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Tracking Integrations</CardTitle>
            <CardDescription>Enter your tracking IDs to monitor traffic and performance.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
             <div className="space-y-2">
               <label className="text-sm font-medium">Google Search Console</label>
               <Input 
                 placeholder="HTML tag verification code" 
                 value={gscVerification}
                 onChange={(e) => setGscVerification(e.target.value)}
               />
               <p className="text-xs text-muted-foreground">The content of google-site-verification meta tag.</p>
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Google Tag Manager ID</label>
               <Input 
                 placeholder="GTM-XXXXXXX" 
                 value={gtmId}
                 onChange={(e) => setGtmId(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Google Analytics 4 ID</label>
               <Input 
                 placeholder="G-XXXXXXXXXX" 
                 value={ga4Id}
                 onChange={(e) => setGa4Id(e.target.value)}
               />
             </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Hero Sliders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             {sliders.map((sliderUrl, index) => (
                <div key={index} className="flex items-end gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Slide {index + 1} Image URL</label>
                    <Input 
                      placeholder="https://example.com/banner.jpg" 
                      value={sliderUrl}
                      onChange={(e) => handleSliderChange(index, e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveSlider(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
             ))}
             <Button variant="outline" className="w-full gap-2 border-dashed border-2 bg-transparent hover:bg-accent/50" onClick={handleAddSlider}>
               <Plus className="h-4 w-4" />
               Add New Slide
             </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Global Promo Banner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Promo Headline</label>
               <Input 
                 placeholder="Special Offer Today!" 
                 value={promoHeadline}
                 onChange={(e) => setPromoHeadline(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Promo Code</label>
               <Input 
                 placeholder="GGWP2026" 
                 value={promoCode}
                 onChange={(e) => setPromoCode(e.target.value)}
               />
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
