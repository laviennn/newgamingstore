"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  Receipt,
  Tag,
  PhoneCall,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface CurrencyChangeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromCurrency: string;
  toCurrency: string;
  fromLanguage?: string;
  toLanguage?: string;
  loading?: boolean;
}

export function CurrencyChangeWarningModal({
  isOpen,
  onClose,
  onConfirm,
  fromCurrency = "IDR",
  toCurrency = "MYR",
  fromLanguage,
  toLanguage,
  loading = false,
}: CurrencyChangeWarningModalProps) {
  const [understood, setUnderstood] = React.useState(false);

  // Reset checkbox when modal opens
  React.useEffect(() => {
    if (isOpen) setUnderstood(false);
  }, [isOpen]);

  const getCurrencyMeta = (curr: string) => {
    if (curr === "MYR") {
      return {
        flag: "🇲🇾",
        name: "Ringgit Malaysia",
        code: "MYR",
        symbol: "RM",
        colorClass: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
        badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/30",
      };
    }
    return {
      flag: "🇮🇩",
      name: "Rupiah Indonesia",
      code: "IDR",
      symbol: "Rp",
      colorClass: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
      badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    };
  };

  const fromMeta = getCurrencyMeta(fromCurrency);
  const toMeta = getCurrencyMeta(toCurrency);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] rounded-[28px]">
        {/* Glow ambient background */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-amber-500/15 blur-[60px] rounded-full pointer-events-none" />

        <div className="p-6 sm:p-7 relative z-10 space-y-6">
          {/* Header with Warning Icon */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-[inset_0_2px_8px_rgba(245,158,11,0.2)]">
              <AlertTriangle className="w-6 h-6 text-amber-500 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Peringatan Perubahan Mata Uang Toko
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Perubahan mata uang utama akan mempengaruhi tampilan katalog, format harga, dan transaksi di toko Anda.
              </DialogDescription>
            </div>
          </div>

          {/* Visual Currency Transition Card */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 backdrop-blur-sm flex items-center justify-between gap-2 shadow-inner">
            <div className="flex-1 flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/40">
              <span className="text-2xl leading-none">{fromMeta.flag}</span>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Mata Uang Awal
                </div>
                <div className="text-sm font-bold truncate text-foreground">
                  {fromMeta.code} ({fromMeta.symbol})
                </div>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>

            <div className="flex-1 flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/40">
              <span className="text-2xl leading-none">{toMeta.flag}</span>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Mata Uang Baru
                </div>
                <div className="text-sm font-bold truncate text-foreground">
                  {toMeta.code} ({toMeta.symbol})
                </div>
              </div>
            </div>
          </div>

          {/* Important Impact Points */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Poin Penting yang Perlu Diperhatikan:
            </div>

            {/* Point 1: Historical Transactions */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-border/40 text-xs">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Receipt className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">Transaksi Historis Aman & Terpisah</span>
                <p className="text-muted-foreground leading-relaxed">
                  Seluruh riwayat pesanan terdahulu tetap tercatat dalam mata uang <strong className="text-foreground">{fromMeta.code} ({fromMeta.symbol})</strong> dan omset akan dilaporkan dalam kartu terpisah di Dashboard.
                </p>
              </div>
            </div>

            {/* Point 2: Catalog Pricing */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-border/40 text-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">Nominal Produk Tidak Dikonversi Kurs Otomatis</span>
                <p className="text-muted-foreground leading-relaxed">
                  Angka harga produk tetap sama (misal nominal 50 tetap 50). Anda sangat disarankan untuk meninjau dan memperbarui harga nominal di menu <strong className="text-foreground">Produk</strong> ke satuan {toMeta.symbol}.
                </p>
              </div>
            </div>

            {/* Point 3: Storefront & Contacts */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-border/40 text-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">Storefront & Format Kontak Otomatis Beralih</span>
                <p className="text-muted-foreground leading-relaxed">
                  Form checkout, ikon bendera ({toMeta.flag}), dan validasi nomor WhatsApp di storefront pelanggan akan otomatis mengikuti format {toMeta.name}.
                </p>
              </div>
            </div>
          </div>

          {/* User Confirmation Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/40 cursor-pointer hover:bg-muted/30 transition-colors">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary/20 accent-primary"
            />
            <span className="text-xs text-muted-foreground select-none">
              Saya memahami konsekuensi ini dan telah siap menyesuaikan harga produk setelah mata uang diubah.
            </span>
          </label>
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="p-4 sm:px-7 bg-muted/20 border-t border-border/50 flex flex-row gap-3 justify-end items-center">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-5 bg-background/60 border-border/60 hover:bg-background/90 transition-colors shadow-2xs"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading || !understood}
            className="rounded-xl px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-[0_4px_14px_rgba(245,158,11,0.35)] transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {loading ? "Menyimpan..." : "Ya, Lanjutkan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
