"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2, AlertCircle, Palette } from "lucide-react";
import { useNotification } from "@/components/ui/notification";
import { createClient } from "@/utils/supabase/client";

export default function ThemeClient() {
  const { showNotification, NotificationComponent } = useNotification();
  const supabase = createClient();
  
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  
  const [tenantId, setTenantId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  
  // Theme Config Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [themeConfig, setThemeConfig] = React.useState<any>({});
  
  // Colors State
  const [primaryColor, setPrimaryColor] = React.useState("#2563eb"); // default blue-600
  const [backgroundColor, setBackgroundColor] = React.useState("#0a0f1d"); // default dark bg
  const [cardColor, setCardColor] = React.useState("#1c2333"); // default card bg
  const [textColor, setTextColor] = React.useState("#ffffff"); // default text white

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
           
           const config = data.theme_config || {};
           setThemeConfig(config);
           
           // Load existing colors if present
           setTimeout(() => {
             setPrimaryColor(config.colors?.primary || "#2563eb");
             setBackgroundColor(config.colors?.background || "#0a0f1d");
             setCardColor(config.colors?.card || "#1c2333");
             setTextColor(config.colors?.text || "#ffffff");
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

  const handleSave = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      const updatedConfig = {
         ...themeConfig,
         colors: {
           primary: primaryColor,
           background: backgroundColor,
           card: cardColor,
           text: textColor
         }
      };

      const { error } = await supabase.from('tenants').update({ theme_config: updatedConfig }).eq('id', tenantId);
      if (error) throw error;
      
      setThemeConfig(updatedConfig);
      showNotification("success", "Tersimpan", "Pengaturan tema berhasil diperbarui.");
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
          <h1 className="text-3xl font-bold tracking-tight">Theme & Branding</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sesuaikan warna toko untuk merepresentasikan brand Anda.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Menyimpan..." : "Simpan Tema"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> Pengaturan Warna</CardTitle>
            <CardDescription>Pilih warna menggunakan color picker atau masukkan kode HEX.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
             <div className="space-y-2">
               <label className="text-sm font-medium">Primary Color</label>
               <div className="flex items-center gap-4">
                 <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" />
                 <Input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 font-mono uppercase" />
               </div>
               <p className="text-xs text-muted-foreground">Digunakan untuk tombol, link aktif, dan aksen utama.</p>
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-medium">Background Color</label>
               <div className="flex items-center gap-4">
                 <Input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" />
                 <Input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 font-mono uppercase" />
               </div>
               <p className="text-xs text-muted-foreground">Warna latar belakang utama seluruh halaman.</p>
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-medium">Card / Box Color</label>
               <div className="flex items-center gap-4">
                 <Input type="color" value={cardColor} onChange={(e) => setCardColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" />
                 <Input type="text" value={cardColor} onChange={(e) => setCardColor(e.target.value)} className="flex-1 font-mono uppercase" />
               </div>
               <p className="text-xs text-muted-foreground">Warna kotak produk, section tertentu, dan modal.</p>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-medium">Text Color</label>
               <div className="flex items-center gap-4">
                 <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" />
                 <Input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 font-mono uppercase" />
               </div>
               <p className="text-xs text-muted-foreground">Warna untuk teks paragraf dan judul.</p>
             </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card className="shadow-sm md:col-span-1 overflow-hidden" style={{ backgroundColor, color: textColor }}>
          <CardHeader className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription style={{ color: textColor, opacity: 0.7 }}>Tampilan sekilas warna tema Anda.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="p-4 rounded-xl border" style={{ backgroundColor: cardColor, borderColor: 'rgba(255,255,255,0.05)' }}>
               <h3 className="text-lg font-bold mb-2">Contoh Card Produk</h3>
               <p className="text-sm mb-4" style={{ opacity: 0.8 }}>Ini adalah tampilan teks di dalam card menggunakan warna Card Color.</p>
               <Button className="w-full text-white" style={{ backgroundColor: primaryColor }}>
                  Beli Sekarang
               </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg" style={{ backgroundColor: primaryColor, boxShadow: `0 0 15px ${primaryColor}80` }}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">Glowing Element</h4>
                <p className="text-xs" style={{ opacity: 0.7 }}>Menggunakan Primary Color</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
