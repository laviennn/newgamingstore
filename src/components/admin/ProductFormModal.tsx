"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProduct } from "@/app/admin/(authenticated)/products/actions";
import { useNotification } from "@/components/ui/notification";
import { Loader2, UploadCloud, DollarSign, Tag } from "lucide-react";
import { uploadFile } from "@/app/actions/upload";
import { compressImageClient } from "@/lib/client-image-compressor";
import Image from "next/image";
import { Currency, CURRENCY_CONFIGS } from "@/lib/currencyUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProductFormModal({ 
  isOpen, 
  onClose, 
  product, 
  games, 
  currency = 'IDR',
  supportedCurrencies = ['IDR'],
  multiCurrencyEnabled = false,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  product?: any; 
  games: any[]; 
  currency?: Currency;
  supportedCurrencies?: Currency[];
  multiCurrencyEnabled?: boolean;
}) {
  const { showNotification, NotificationComponent } = useNotification();
  const [loading, setLoading] = React.useState(false);
  const [isFlashSale, setIsFlashSale] = React.useState(product?.is_flash_sale || false);
  const [imageUrl, setImageUrl] = React.useState(product?.image_url || "");
  const [uploadingImage, setUploadingImage] = React.useState(false);

  // Multi-Currency Names & Prices State
  const [names, setNames] = React.useState<Record<string, string>>({});
  const [prices, setPrices] = React.useState<Record<string, number | string>>({});
  const [originalPrices, setOriginalPrices] = React.useState<Record<string, number | string>>({});

  const activeCurrencies = React.useMemo(() => {
    if (multiCurrencyEnabled && supportedCurrencies && supportedCurrencies.length > 0) {
      return supportedCurrencies;
    }
    return [currency];
  }, [multiCurrencyEnabled, supportedCurrencies, currency]);

  React.useEffect(() => {
    setIsFlashSale(product?.is_flash_sale || false);
    setImageUrl(product?.image_url || "");

    const initialNames: Record<string, string> = {};
    const initialPrices: Record<string, number | string> = {};
    const initialOriginalPrices: Record<string, number | string> = {};

    activeCurrencies.forEach((cur) => {
      if (product?.names && product.names[cur]) {
        initialNames[cur] = product.names[cur];
      } else {
        initialNames[cur] = product?.name || "";
      }

      if (product?.prices && product.prices[cur] !== undefined && product.prices[cur] !== null) {
        initialPrices[cur] = product.prices[cur];
      } else if (product?.price !== undefined && product?.price !== null) {
        initialPrices[cur] = product.price;
      } else {
        initialPrices[cur] = "";
      }

      if (product?.original_prices && product.original_prices[cur] !== undefined && product.original_prices[cur] !== null) {
        initialOriginalPrices[cur] = product.original_prices[cur];
      } else if (product?.original_price !== undefined && product?.original_price !== null) {
        initialOriginalPrices[cur] = product.original_price;
      } else {
        initialOriginalPrices[cur] = "";
      }
    });

    setNames(initialNames);
    setPrices(initialPrices);
    setOriginalPrices(initialOriginalPrices);
  }, [product, activeCurrencies, isOpen]);

  const handleNameChange = (cur: Currency, val: string) => {
    setNames((prev) => ({
      ...prev,
      [cur]: val,
    }));
  };

  const handlePriceChange = (cur: Currency, val: string) => {
    setPrices((prev) => ({
      ...prev,
      [cur]: val === "" ? "" : Number(val),
    }));
  };

  const handleOriginalPriceChange = (cur: Currency, val: string) => {
    setOriginalPrices((prev) => ({
      ...prev,
      [cur]: val === "" ? "" : Number(val),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    try {
      const compressed = await compressImageClient(file, "icon");
      const formData = new FormData();
      formData.append("file", compressed.file);

      const result = await uploadFile(formData);
      
      if (result.error) {
        showNotification("error", "Gagal Unggah", result.error);
      } else if (result.url) {
        setImageUrl(result.url);
        const percentSaved = Math.round(compressed.ratio * 100);
        showNotification(
          "success",
          "Unggah Berhasil",
          percentSaved > 0
            ? `Terkonversi ke WebP (${percentSaved}% lebih hemat)!`
            : "Gambar produk berhasil diunggah."
        );
      }
    } catch (err: any) {
      showNotification("error", "Gagal Unggah", err.message || "Gagal mengompres gambar.");
    } finally {
      setUploadingImage(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("image_url", imageUrl);

    // Build names and numeric prices objects (only for enabled/filled currencies)
    const finalNames: Record<string, string> = {};
    const finalPrices: Record<string, number> = {};
    const finalOriginalPrices: Record<string, number> = {};

    let hasAtLeastOnePrice = false;
    const globalFallbackName = (formData.get("name") as string || product?.name || "").trim();

    activeCurrencies.forEach((cur) => {
      const rawPrice = prices[cur];
      const val = Number(rawPrice);

      // Hanya simpan currency jika admin mengisi harga > 0
      if (rawPrice !== "" && rawPrice !== undefined && rawPrice !== null && !isNaN(val) && val > 0) {
        hasAtLeastOnePrice = true;
        finalPrices[cur] = val;
        
        const customName = (names[cur] || "").trim();
        finalNames[cur] = customName || globalFallbackName;

        if (isFlashSale) {
          const rawOrig = originalPrices[cur];
          const origVal = Number(rawOrig);
          if (rawOrig !== "" && rawOrig !== undefined && !isNaN(origVal) && origVal > 0) {
            finalOriginalPrices[cur] = origVal;
          }
        }
      }
    });

    if (!hasAtLeastOnePrice) {
      showNotification(
        "error",
        "Harga Wajib Diisi",
        "Minimal satu wilayah / mata uang harus memiliki harga yang valid (> 0). Kosongkan wilayah yang tidak tersedia."
      );
      return;
    }

    setLoading(true);

    const primaryCurrency = currency || activeCurrencies[0] || "IDR";
    const availableCurrencies = Object.keys(finalPrices);
    const resolvedPrimaryCurrency = finalPrices[primaryCurrency] ? primaryCurrency : availableCurrencies[0];

    const primaryName = finalNames[resolvedPrimaryCurrency] || globalFallbackName || Object.values(finalNames)[0] || "";
    const primaryPrice = finalPrices[resolvedPrimaryCurrency] || Object.values(finalPrices)[0] || 0;
    const primaryOriginalPrice = isFlashSale 
      ? (finalOriginalPrices[resolvedPrimaryCurrency] || Object.values(finalOriginalPrices)[0] || null)
      : null;

    formData.set("name", primaryName);
    formData.set("names", JSON.stringify(finalNames));
    formData.set("price", primaryPrice.toString());
    if (primaryOriginalPrice !== null) {
      formData.set("original_price", primaryOriginalPrice.toString());
    } else {
      formData.delete("original_price");
    }

    formData.set("prices", JSON.stringify(finalPrices));
    formData.set("original_prices", JSON.stringify(finalOriginalPrices));

    const result = await saveProduct(formData, product?.id);
    
    setLoading(false);
    
    if (result.error) {
      showNotification("error", "Gagal Menyimpan", result.error);
    } else {
      showNotification("success", "Berhasil", `Produk berhasil ${product ? 'diperbarui' : 'ditambahkan'}!`);
      onClose();
    }
  }

  return (
    <>
      {NotificationComponent}
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span>{product ? "Edit Product" : "Add New Product"}</span>
            <div className="flex items-center gap-1.5">
              {activeCurrencies.map((cur) => {
                const conf = CURRENCY_CONFIGS[cur] || CURRENCY_CONFIGS.IDR;
                return (
                  <span key={cur} className="text-xs font-bold px-2 py-0.5 rounded-full border bg-muted/50 border-border text-foreground shadow-2xs">
                    {conf.flag} {conf.code}
                  </span>
                );
              })}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="game_id" className="text-sm font-medium">Select Game</label>
            <select 
              id="game_id" 
              name="game_id" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={product?.game_id || ""}
              required
            >
              <option value="" disabled>Select a game...</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Product Name Inputs (Dynamic Multi-Currency or Single) */}
          {activeCurrencies.length > 1 ? (
            <div className="space-y-3 border border-border/60 rounded-xl p-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-primary" /> Nama Item / Denominasi per Wilayah
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Opsional: Kosongkan jika tidak dijual di region tsb
                </span>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                {activeCurrencies.map((cur) => {
                  const conf = CURRENCY_CONFIGS[cur] || CURRENCY_CONFIGS.IDR;
                  const placeholder = cur === 'IDR' ? 'Contoh: 2.500 Diamonds' : cur === 'MYR' ? 'Contoh: 4650 Diamonds' : 'Contoh: 250 Diamonds';
                  return (
                    <div key={cur} className="p-2.5 bg-background rounded-lg border border-border space-y-1.5 shadow-2xs">
                      <span className="text-xs font-bold flex items-center gap-1 text-foreground">
                        <span>{conf.flag}</span>
                        <span>Item {conf.code}</span>
                      </span>
                      <Input
                        placeholder={placeholder}
                        value={names[cur] !== undefined ? names[cur] : ""}
                        onChange={(e) => handleNameChange(cur, e.target.value)}
                        className="text-xs font-medium"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Product Name (e.g., 86 Diamonds)</label>
              <Input 
                id="name" 
                name="name" 
                placeholder="e.g., 86 Diamonds" 
                defaultValue={product?.name || ""}
                required 
              />
            </div>
          )}

          {/* Product Icon / Image Upload */}
          <div className="space-y-2 border border-border/50 rounded-lg p-3 bg-muted/20">
            <label className="text-sm font-medium">Product Icon</label>
            <div className="flex items-center gap-4">
               {imageUrl && (
                 <div className="relative w-12 h-12 rounded bg-background border border-border shrink-0 overflow-hidden">
                    <Image src={imageUrl} alt="Icon Preview" fill sizes="48px" className="object-cover" />
                 </div>
               )}
               <div className="flex-1 space-y-2">
                 <Input 
                    type="url" 
                    placeholder="https://..." 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    className="h-8 text-xs" 
                 />
                 <label className="flex items-center justify-center w-full h-8 px-3 py-1 text-xs font-semibold rounded-md border border-input bg-background hover:bg-muted cursor-pointer transition-colors">
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 mr-2" />}
                    {uploadingImage ? "Uploading..." : "Upload from Computer"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                 </label>
               </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="variant_type" className="text-sm font-medium">Variant Type (Optional)</label>
            <select 
              id="variant_type" 
              name="variant_type" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue={product?.variant_type || ""}
            >
              <option value="">None (Default)</option>
              <option value="iOS">Via iOS</option>
              <option value="Android">Via Android</option>
            </select>
            <p className="text-xs text-muted-foreground">Used for dynamic top up models (e.g. FC Mobile).</p>
          </div>

          {/* Multi-Currency Price Inputs */}
          <div className="space-y-3 border-t border-border/40 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-primary" /> Harga Produk per Mata Uang
              </label>
              <span className="text-[11px] text-muted-foreground">
                {activeCurrencies.length > 1 ? "Kosongkan jika tidak dijual di negara tsb" : "Harga tunggal"}
              </span>
            </div>

            <div className={`grid gap-3 ${activeCurrencies.length > 1 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
              {activeCurrencies.map((cur) => {
                const conf = CURRENCY_CONFIGS[cur] || CURRENCY_CONFIGS.IDR;
                const isDecimal = conf.decimals > 0;
                const isFilled = prices[cur] !== "" && prices[cur] !== undefined && Number(prices[cur]) > 0;

                return (
                  <div 
                    key={cur} 
                    className={`p-3 rounded-xl border transition-colors space-y-1.5 ${
                      isFilled 
                        ? "bg-muted/60 border-primary/40 shadow-xs" 
                        : "bg-muted/20 border-border/40 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold flex items-center gap-1 text-foreground">
                        <span>{conf.flag}</span>
                        <span>Harga {conf.code} ({conf.symbol})</span>
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                        isFilled ? "bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"
                      }`}>
                        {isFilled ? "Tersedia" : "Kosong"}
                      </span>
                    </div>
                    <Input
                      type="number"
                      step={isDecimal ? "0.01" : "1"}
                      min="0"
                      placeholder={isDecimal ? `${conf.symbol} 1.50 (Kosongkan jika N/A)` : `${conf.symbol} 20000 (Kosongkan jika N/A)`}
                      value={prices[cur] !== undefined ? prices[cur] : ""}
                      onChange={(e) => handlePriceChange(cur, e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="active" className="text-sm font-medium">Status</label>
            <select 
              id="active" 
              name="active" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue={product ? (product.active ? "true" : "false") : "true"}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="space-y-2 border-t border-border/40 pt-4 mt-4">
            <h4 className="font-semibold text-sm">Flash Sale Settings</h4>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="is_flash_sale" className="text-sm font-medium">Is Flash Sale?</label>
            <select 
              id="is_flash_sale" 
              name="is_flash_sale" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={isFlashSale ? "true" : "false"}
              onChange={(e) => setIsFlashSale(e.target.value === "true")}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          {isFlashSale && (
            <>
              {/* Multi-Currency Original Price Inputs */}
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-medium">Harga Asli / Coret (Original Price)</label>
                <div className={`grid gap-3 ${activeCurrencies.length > 1 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
                  {activeCurrencies.map((cur) => {
                    const conf = CURRENCY_CONFIGS[cur] || CURRENCY_CONFIGS.IDR;
                    const isDecimal = conf.decimals > 0;
                    return (
                      <div key={cur} className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-1.5">
                        <span className="text-xs font-bold flex items-center gap-1 text-muted-foreground">
                          <span>{conf.flag}</span>
                          <span>Coret {conf.code} ({conf.symbol})</span>
                        </span>
                        <Input
                          type="number"
                          step={isDecimal ? "0.01" : "1"}
                          min="0"
                          placeholder={isDecimal ? `${conf.symbol} 2.00` : `${conf.symbol} 25000`}
                          value={originalPrices[cur] !== undefined ? originalPrices[cur] : ""}
                          onChange={(e) => handleOriginalPriceChange(cur, e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Harga sebelum promo (akan dicoret di storefront).</p>
              </div>

              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label htmlFor="flash_sale_stock" className="text-sm font-medium">Flash Sale Stock</label>
                <Input 
                  id="flash_sale_stock" 
                  name="flash_sale_stock" 
                  type="number"
                  min="0"
                  placeholder="e.g., 18" 
                  defaultValue={product?.flash_sale_stock || ""}
                  required={isFlashSale}
                />
                <p className="text-xs text-muted-foreground">Remaining quota for the promo.</p>
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </>
  );
}

