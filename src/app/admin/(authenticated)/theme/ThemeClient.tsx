"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2, AlertCircle, Palette, CheckCircle2, Globe2 } from "lucide-react";
import { useNotification } from "@/components/ui/notification";
import { createClient } from "@/utils/supabase/client";
import { THEME_PRESETS, ThemePreset, ThemeConfig, getThemeConfigOrDefault } from "@/lib/themeUtils";
import { Language } from "@/lib/dictionary";
import { Currency } from "@/lib/currencyUtils";
import { CurrencyChangeWarningModal } from "@/components/admin/CurrencyChangeWarningModal";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import { SkeuoToggle } from "@/components/ui/skeuo-switch";

export default function ThemeClient() {
  const { showNotification, NotificationComponent } = useNotification();
  const supabase = createClient();
  
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  
  const [tenantId, setTenantId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  
  // Theme Config State
  const [themeConfig, setThemeConfig] = React.useState<any>({});
  const [themePreset, setThemePreset] = React.useState<ThemePreset>("default");
  const [language, setLanguage] = React.useState<Language>("id");
  const [currency, setCurrency] = React.useState<Currency>("IDR");
  const [initialCurrency, setInitialCurrency] = React.useState<Currency>("IDR");
  const [isWarningModalOpen, setIsWarningModalOpen] = React.useState(false);
  
  // Multi-Currency State
  const [multiCurrencyEnabled, setMultiCurrencyEnabled] = React.useState(false);
  const [supportedCurrencies, setSupportedCurrencies] = React.useState<Currency[]>(["IDR"]);
  const [defaultCurrency, setDefaultCurrency] = React.useState<Currency>("IDR");

  // Custom Colors State
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [backgroundColor, setBackgroundColor] = React.useState("#0f172a");
  const [cardColor, setCardColor] = React.useState("#1e293b");
  const [textColor, setTextColor] = React.useState("#f8fafc");

  // Load existing tenant settings
  React.useEffect(() => {
    async function loadTenant() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setErrorMsg("Unauthorized");
          return;
        }

        // Get tenant ID from cookie/header or admin action
        const activeTenantId = await getActiveAdminTenantId();
        if (!activeTenantId) {
          setErrorMsg("No tenant found");
          return;
        }
        
        setTenantId(activeTenantId);

        const { data: tenant, error } = await supabase
          .from('tenants')
          .select('theme_config')
          .eq('id', activeTenantId)
          .single();

        if (error) throw error;
        
        if (tenant && tenant.theme_config) {
          const config = getThemeConfigOrDefault(tenant.theme_config);
          setThemeConfig(tenant.theme_config);
          setThemePreset(config.preset || "default");
          setPrimaryColor(config.colors.primary);
          setBackgroundColor(config.colors.background);
          setCardColor(config.colors.card);
          setTextColor(config.colors.text);
          setLanguage(config.language || "id");
          const curr = (config.currency || (config.language === 'ms' ? 'MYR' : 'IDR')) as Currency;
          setCurrency(curr);
          setInitialCurrency(curr);

          setMultiCurrencyEnabled(!!tenant.theme_config.multi_currency_enabled);
          setSupportedCurrencies(
            Array.isArray(tenant.theme_config.supported_currencies) && tenant.theme_config.supported_currencies.length > 0
              ? tenant.theme_config.supported_currencies
              : [curr]
          );
          setDefaultCurrency(tenant.theme_config.default_currency || curr);
        }
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        setErrorMsg(error.message || "Failed to load theme");
      } finally {
        setLoading(false);
      }
    }
    loadTenant();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (presetKey: ThemePreset) => {
    setThemePreset(presetKey);
    const colors = THEME_PRESETS[presetKey];
    setPrimaryColor(colors.primary);
    setBackgroundColor(colors.background);
    setCardColor(colors.card);
    setTextColor(colors.text);
  };

  const handleToggleSupportedCurrency = (code: Currency, checked: boolean) => {
    let next = checked
      ? [...supportedCurrencies, code]
      : supportedCurrencies.filter((c) => c !== code);
    
    if (next.length === 0) {
      next = [code]; // Must keep at least 1
    }
    setSupportedCurrencies(next);

    if (!next.includes(defaultCurrency)) {
      const fallback = next[0];
      setDefaultCurrency(fallback);
      setCurrency(fallback);
    }
  };

  const handleDefaultCurrencyChange = (newCur: Currency) => {
    setDefaultCurrency(newCur);
    setCurrency(newCur);
    // Automatically suggest default language if changing default currency
    if (newCur === "MYR" && language === "id") {
      setLanguage("ms");
    } else if (newCur === "IDR" && language === "ms") {
      setLanguage("id");
    } else if (newCur === "SGD" && (language === "id" || language === "ms")) {
      setLanguage("en");
    }
  };

  const executeSave = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      const activeDefaultCurr = multiCurrencyEnabled ? defaultCurrency : currency;
      const updatedConfig = {
         ...themeConfig,
         themePreset,
         language,
         currency: activeDefaultCurr,
         multi_currency_enabled: multiCurrencyEnabled,
         supported_currencies: multiCurrencyEnabled ? supportedCurrencies : [activeDefaultCurr],
         default_currency: activeDefaultCurr,
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
      setInitialCurrency(activeDefaultCurr);
      setIsWarningModalOpen(false);
      showNotification("success", "Tersimpan", "Pengaturan tema, bahasa & multi-currency berhasil diperbarui.");
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      showNotification("error", "Gagal", error.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!tenantId) return;
    
    // Only warn single-currency tenants if they change the single base currency
    if (!multiCurrencyEnabled && currency !== initialCurrency) {
      setIsWarningModalOpen(true);
      return;
    }
    
    await executeSave();
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center">Loading...</div>;
  if (errorMsg) return <div className="flex h-[50vh] items-center justify-center text-destructive"><AlertCircle className="mr-2"/>{errorMsg}</div>;

  return (
    <div className="space-y-6 pb-20">
      {NotificationComponent}
      <CurrencyChangeWarningModal 
        isOpen={isWarningModalOpen} 
        onClose={() => setIsWarningModalOpen(false)}
        onConfirm={executeSave}
        fromCurrency={initialCurrency}
        toCurrency={currency}
        loading={saving}
      />
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
        <div className="flex flex-col gap-6 md:col-span-1">
          <Card className="shadow-sm">
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> Preset Tema</CardTitle>
            <CardDescription>Pilih preset tema bawaan. Anda dapat menyesuaikan warna spesifik di bawahnya.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Default Preset Option */}
                <div 
                  className={`border-2 rounded-xl p-3 cursor-pointer transition-all relative overflow-hidden ${themePreset === 'default' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                  onClick={() => applyPreset('default')}
                  style={{ backgroundColor: THEME_PRESETS.default.background }}
                >
                   {themePreset === 'default' && <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 text-blue-500" />}
                   <div className="w-full h-16 rounded-lg mb-2 border border-white/10" style={{ backgroundColor: THEME_PRESETS.default.card }}>
                     <div className="w-1/2 h-6 m-1.5 rounded-md" style={{ backgroundColor: THEME_PRESETS.default.primary }}></div>
                   </div>
                   <p className="font-semibold text-center text-white text-xs">Default (Neon Blue)</p>
                </div>
                
                {/* Emerald Preset Option */}
                <div 
                  className={`border-2 rounded-xl p-3 cursor-pointer transition-all relative overflow-hidden ${themePreset === 'emerald' ? 'border-[#10b981] ring-2 ring-[#10b981]/20' : 'border-border hover:border-[#10b981]/50'}`}
                  onClick={() => applyPreset('emerald')}
                  style={{ backgroundColor: THEME_PRESETS.emerald.background }}
                >
                   {themePreset === 'emerald' && <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 text-[#10b981]" />}
                   <div className="w-full h-16 rounded-lg mb-2 border border-white/10" style={{ backgroundColor: THEME_PRESETS.emerald.card }}>
                     <div className="w-1/2 h-6 m-1.5 rounded-md" style={{ backgroundColor: THEME_PRESETS.emerald.primary }}></div>
                   </div>
                   <p className="font-semibold text-center text-white text-xs">Emerald (Cyber Green)</p>
                </div>

                {/* Neon Gaming Preset Option */}
                <div 
                  className={`border-2 rounded-xl p-3 cursor-pointer transition-all relative overflow-hidden ${themePreset === 'neon-gaming' ? 'border-[#14D0C7] ring-2 ring-[#14D0C7]/20' : 'border-border hover:border-[#14D0C7]/50'}`}
                  onClick={() => applyPreset('neon-gaming')}
                  style={{ backgroundColor: THEME_PRESETS['neon-gaming'].background }}
                >
                   {themePreset === 'neon-gaming' && <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 text-[#14D0C7]" />}
                   <div className="w-full h-16 rounded-lg mb-2 border border-white/10" style={{ backgroundColor: THEME_PRESETS['neon-gaming'].card }}>
                     <div className="w-1/2 h-6 m-1.5 rounded-md" style={{ backgroundColor: THEME_PRESETS['neon-gaming'].primary }}></div>
                   </div>
                   <p className="font-semibold text-center text-white text-xs">Neon Gaming (Cyber Aqua)</p>
                </div>
             </div>
          </CardContent>

          <CardHeader className="pt-0">
            <CardTitle className="text-base">Kustomisasi Warna</CardTitle>
            <CardDescription>Pilih warna menggunakan color picker atau masukkan kode HEX secara manual.</CardDescription>
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

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-primary" /> Multi-Currency & Multi-Region
                </CardTitle>
                <CardDescription>
                  Aktifkan kemampuan toko untuk melayani pelanggan dari Indonesia (IDR), Malaysia (MYR), dan Singapura (SGD).
                </CardDescription>
              </div>
              <SkeuoToggle
                checked={multiCurrencyEnabled}
                onChange={(val) => setMultiCurrencyEnabled(val)}
                activeText="Aktif"
                inactiveText="Nonaktif"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {multiCurrencyEnabled && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-xl border animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Wilayah / Mata Uang yang Didukung:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {(['IDR', 'MYR', 'SGD'] as Currency[]).map((cur) => (
                      <label key={cur} className="flex items-center gap-2 p-2 rounded-lg border bg-background hover:bg-muted/50 cursor-pointer transition-colors text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={supportedCurrencies.includes(cur)}
                          onChange={(e) => handleToggleSupportedCurrency(cur, e.target.checked)}
                          className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                        />
                        <span>{cur === 'IDR' ? '🇮🇩 IDR (Rp)' : cur === 'MYR' ? '🇲🇾 MYR (RM)' : '🇸🇬 SGD (S$)'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Mata Uang Bawaan (Default untuk Pengunjung Baru):
                  </label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={defaultCurrency}
                    onChange={(e) => handleDefaultCurrencyChange(e.target.value as Currency)}
                  >
                    {supportedCurrencies.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur === 'IDR' ? '🇮🇩 Indonesia - Rupiah (IDR)' : cur === 'MYR' ? '🇲🇾 Malaysia - Ringgit (MYR)' : '🇸🇬 Singapore - Dolar (SGD)'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    Mata uang ini yang akan otomatis aktif pertama kali saat pengunjung baru membuka etalase toko Anda.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Bahasa Utama Storefront</CardTitle>
            <CardDescription>Pilih bahasa default yang terbuka saat pengunjung pertama kali datang.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div 
              className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all relative ${language === 'id' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/50'}`}
              onClick={() => { setLanguage('id'); }}
            >
              {language === 'id' && <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 text-primary" />}
              <div className="text-3xl mb-1">🇮🇩</div>
              <p className="font-semibold text-center text-xs">Indonesia (ID)</p>
              <span className="text-[10px] text-muted-foreground mt-1 bg-white/5 px-2 py-0.5 rounded-full">
                Bahasa Indonesia
              </span>
            </div>
            <div 
              className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all relative ${language === 'ms' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/50'}`}
              onClick={() => { setLanguage('ms'); }}
            >
              {language === 'ms' && <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 text-primary" />}
              <div className="text-3xl mb-1">🇲🇾</div>
              <p className="font-semibold text-center text-xs">Malaysia (MS)</p>
              <span className="text-[10px] text-muted-foreground mt-1 bg-white/5 px-2 py-0.5 rounded-full">
                Bahasa Melayu
              </span>
            </div>
            <div 
              className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all relative ${language === 'en' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/50'}`}
              onClick={() => { setLanguage('en'); }}
            >
              {language === 'en' && <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 text-primary" />}
              <div className="text-3xl mb-1">🇬🇧</div>
              <p className="font-semibold text-center text-xs">English (EN)</p>
              <span className="text-[10px] text-muted-foreground mt-1 bg-white/5 px-2 py-0.5 rounded-full">
                English
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
        {/* Live Preview */}
        <Card className="shadow-sm md:col-span-1 overflow-hidden transition-colors duration-300" style={{ backgroundColor, color: textColor }}>
          <CardHeader className="border-b transition-colors duration-300" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription style={{ color: textColor, opacity: 0.7 }}>Tampilan sekilas warna tema Anda pada Storefront.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="p-4 rounded-xl border transition-colors duration-300" style={{ backgroundColor: cardColor, borderColor: 'rgba(255,255,255,0.05)' }}>
               <h3 className="text-lg font-bold mb-2">Contoh Card Produk</h3>
               <p className="text-sm mb-4" style={{ opacity: 0.8 }}>Ini adalah tampilan teks di dalam card menggunakan warna Card Color.</p>
               <Button className="w-full text-white border-0 transition-colors duration-300 shadow-sm hover:opacity-90" style={{ backgroundColor: primaryColor }}>
                  Beli Sekarang
               </Button>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl border transition-colors duration-300" style={{ backgroundColor: cardColor, borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300" style={{ backgroundColor: primaryColor, boxShadow: `0 0 20px ${primaryColor}80` }}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">Glowing Element</h4>
                <p className="text-xs" style={{ opacity: 0.7 }}>Menggunakan Primary Color dengan aksen glow</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
