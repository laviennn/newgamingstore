"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2, AlertCircle, UploadCloud } from "lucide-react";
import { useNotification } from "@/components/ui/notification";
import { createClient } from "@/utils/supabase/client";
import { uploadFile } from "@/app/actions/upload";
import Image from "next/image";

import { SkeuoToggle } from "@/components/ui/skeuo-switch";

export default function ContactsPage() {
  const { showNotification, NotificationComponent } = useNotification();
  const supabase = createClient();
  
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  
  const [tenantId, setTenantId] = React.useState<string | null>(null);
  const [tenantName, setTenantName] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  
  // Theme Config Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [themeConfig, setThemeConfig] = React.useState<any>({});
  
  // Contact State
  const [whatsapp, setWhatsapp] = React.useState("");
  const [instagram, setInstagram] = React.useState("");
  const [tiktok, setTiktok] = React.useState("");
  const [youtube, setYoutube] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [operationalHours, setOperationalHours] = React.useState("");
  
  // Footer Banner State
  const [footerBannerUrl, setFooterBannerUrl] = React.useState("");
  const [uploadingBanner, setUploadingBanner] = React.useState(false);

  // Floating WhatsApp State
  const [waFloatingActive, setWaFloatingActive] = React.useState(true);
  const [waFloatingAvatarUrl, setWaFloatingAvatarUrl] = React.useState("");
  const [waFloatingText, setWaFloatingText] = React.useState("Chat CS Online");
  const [waDefaultMessage, setWaDefaultMessage] = React.useState("Halo Admin, saya ingin bertanya seputar layanan top-up.");
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

  // WhatsApp Channel State
  const [waChannelActive, setWaChannelActive] = React.useState(false);
  const [waChannelUrl, setWaChannelUrl] = React.useState("");

  React.useEffect(() => {
    async function loadTenant() {
      try {
        const hostname = window.location.hostname;
        const { data: exactData, error } = await supabase.from('tenants').select('*').eq('admin_domain', hostname).maybeSingle();
        let data = exactData;
        
        if (!data && !error) {
          const res = await supabase.from('tenants').select('*').limit(1).maybeSingle();
          data = res.data;
        }
        
        if (data) {
           setTenantId(data.id);
           setTenantName(data.name);
           
           const config = data.theme_config || {};
           setThemeConfig(config);
           
           setTimeout(() => {
             setWhatsapp(config.whatsapp || "");
             setInstagram(config.instagram || "");
             setTiktok(config.tiktok || "");
             setYoutube(config.youtube || "");
             setEmail(config.email || "");
             setOperationalHours(config.operationalHours || "");
             setFooterBannerUrl(config.footerBannerUrl || "");
             setWaFloatingActive(config.waFloatingActive ?? true);
             setWaFloatingAvatarUrl(config.waFloatingAvatarUrl || "");
             setWaFloatingText(config.waFloatingText || "Chat CS Online");
             setWaDefaultMessage(config.waDefaultMessage || "Halo Admin, saya ingin bertanya seputar layanan top-up.");
             setWaChannelActive(config.waChannelActive ?? false);
             setWaChannelUrl(config.waChannelUrl || "");
           }, 0);
        } else {
           setErrorMsg(`No tenants found in database.`);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load tenant context.");
      } finally {
        setLoading(false);
      }
    }
    loadTenant();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFile(formData);
      
      if (result.error) {
        showNotification("error", "Upload Gagal", result.error);
      } else if (result.url) {
        setFooterBannerUrl(result.url);
        showNotification("success", "Berhasil", "Banner berhasil diunggah.");
      }
    } catch (err) {
      showNotification("error", "Upload Gagal", "Terjadi kesalahan.");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFile(formData);
      
      if (result.error) {
        showNotification("error", "Upload Gagal", result.error);
      } else if (result.url) {
        setWaFloatingAvatarUrl(result.url);
        showNotification("success", "Berhasil", "Karakter avatar WhatsApp berhasil diunggah.");
      }
    } catch (err) {
      showNotification("error", "Upload Gagal", "Terjadi kesalahan.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      const updatedConfig = {
         ...themeConfig,
         whatsapp,
         instagram,
         tiktok,
         youtube,
         email,
         operationalHours,
         footerBannerUrl,
         waFloatingActive,
         waFloatingAvatarUrl,
         waFloatingText,
         waDefaultMessage,
         waChannelActive,
         waChannelUrl
      };

      const { error } = await supabase.from('tenants').update({ theme_config: updatedConfig }).eq('id', tenantId);
      if (error) throw error;
      
      setThemeConfig(updatedConfig);
      showNotification("success", "Tersimpan", "Informasi kontak, footer, dan WhatsApp berhasil diperbarui.");
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      showNotification("error", "Gagal", error.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center">Loading...</div>;
  if (errorMsg) return <div className="flex h-[50vh] items-center justify-center text-destructive"><AlertCircle className="mr-2"/>{errorMsg}</div>;

  return (
    <div className="space-y-6 pb-20">
      {NotificationComponent}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kontak & Footer</h1>
          <p className="text-muted-foreground mt-1 text-sm">Kelola informasi kontak, sosial media, banner, dan widget Floating WhatsApp untuk <strong className="text-foreground">{tenantName}</strong>.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Kontak & WhatsApp</CardTitle>
            <CardDescription>Nomor WhatsApp dan Pesan Otomatis (Default Message) ini digunakan bersama di Footer & Floating Widget.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
             <div className="space-y-2">
               <label className="text-sm font-medium">Nomor WhatsApp</label>
               <Input placeholder="628123456789" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
               <p className="text-xs text-muted-foreground">Format nomor tanpa + (contoh: 628...)</p>
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Email</label>
               <Input placeholder="cs@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
             </div>
             <div className="space-y-2 md:col-span-2">
               <label className="text-sm font-medium">Pesan Otomatis WhatsApp (Default Message)</label>
               <Input placeholder="Halo Admin, saya ingin bertanya seputar layanan top-up..." value={waDefaultMessage} onChange={(e) => setWaDefaultMessage(e.target.value)} />
               <p className="text-xs text-muted-foreground">Pesan yang otomatis terisi saat visitor mengklik tombol WhatsApp (di Footer maupun Floating Widget).</p>
             </div>
             <div className="space-y-2 md:col-span-2">
               <label className="text-sm font-medium">Jam Operasional</label>
               <Input placeholder="08:00 - 23:00 WIB" value={operationalHours} onChange={(e) => setOperationalHours(e.target.value)} />
             </div>
          </CardContent>
        </Card>

        {/* Floating WhatsApp Card */}
        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Floating WhatsApp Widget (Karakter Custom)</span>
              <SkeuoToggle 
                checked={waFloatingActive} 
                onChange={setWaFloatingActive} 
                activeText="Aktif" 
                inactiveText="Nonaktif" 
              />
            </CardTitle>
            <CardDescription>Atur status aktif/nonaktif serta gambar karakter avatar kustom untuk tombol melayang WhatsApp di pojok kanan bawah.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid gap-6 md:grid-cols-2">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Label Teks Widget</label>
                 <Input placeholder="Chat CS Online" value={waFloatingText} onChange={(e) => setWaFloatingText(e.target.value)} />
                 <p className="text-xs text-muted-foreground">Teks balon ucapan di samping karakter.</p>
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-medium">Upload Karakter Avatar (R2 Storage)</label>
                 <div className="flex items-center gap-4">
                   <label className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-muted/50">
                      {uploadingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                      <span>{uploadingAvatar ? "Mengupload..." : "Upload Karakter"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                   </label>
                   <Input placeholder="Atau paste URL karakter..." value={waFloatingAvatarUrl} onChange={(e) => setWaFloatingAvatarUrl(e.target.value)} className="flex-1" />
                 </div>
               </div>
             </div>

             {waFloatingAvatarUrl && (
                <div className="mt-4 p-4 border rounded-xl bg-muted/30 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary bg-background shadow-md">
                    <Image src={waFloatingAvatarUrl.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com')} alt="WA Character Avatar" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Preview Character Avatar</h4>
                    <p className="text-xs text-muted-foreground">Gambar ini akan melayang di pojok kanan bawah Storefront Anda.</p>
                  </div>
                </div>
             )}
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2 border-green-500/30">
          <CardHeader className="bg-green-500/5 border-b border-border/50">
            <CardTitle className="flex items-center justify-between text-green-500">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                WhatsApp Channel Banner
              </span>
              <SkeuoToggle 
                checked={waChannelActive} 
                onChange={setWaChannelActive} 
                activeText="Aktif" 
                inactiveText="Nonaktif" 
              />
            </CardTitle>
            <CardDescription>Banner WhatsApp Channel yang tampil di Dashboard Member.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2 max-w-2xl">
              <label className="text-sm font-medium">Link Tautan Saluran (Channel URL)</label>
              <Input placeholder="https://whatsapp.com/channel/..." value={waChannelUrl} onChange={(e) => setWaChannelUrl(e.target.value)} />
              <p className="text-xs text-muted-foreground">URL yang akan dibuka ketika pengguna menekan tombol "Gabung Sekarang".</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Sosial Media</CardTitle>
            <CardDescription>URL lengkap menuju profil sosial media Anda.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
             <div className="space-y-2">
               <label className="text-sm font-medium">Instagram</label>
               <Input placeholder="https://instagram.com/..." value={instagram} onChange={(e) => setInstagram(e.target.value)} />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">TikTok</label>
               <Input placeholder="https://tiktok.com/@..." value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">YouTube</label>
               <Input placeholder="https://youtube.com/..." value={youtube} onChange={(e) => setYoutube(e.target.value)} />
             </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Footer Banner</CardTitle>
            <CardDescription>Gambar spanduk besar yang berada di atas Footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-4">
               <label className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-muted/50">
                  {uploadingBanner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                  <span>{uploadingBanner ? "Mengupload..." : "Upload Gambar ke R2"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={uploadingBanner} />
               </label>
               <Input placeholder="Atau paste URL gambar..." value={footerBannerUrl} onChange={(e) => setFooterBannerUrl(e.target.value)} className="flex-1" />
             </div>
             {footerBannerUrl && (
                <div className="mt-4 relative w-full h-[200px] md:h-[300px] rounded-xl overflow-hidden border bg-muted">
                  <Image src={footerBannerUrl.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com')} alt="Footer Banner" fill className="object-cover" />
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
