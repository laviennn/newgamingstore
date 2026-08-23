"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Currency, CURRENCY_CONFIGS } from "@/lib/currencyUtils";
import { Search, Check, Globe, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CurrencySelectorProps {
  currentCurrency: Currency;
  supportedCurrencies?: Currency[];
  variant?: "pill" | "sidebar-item" | "icon";
  className?: string;
}

export function CurrencySelector({
  currentCurrency = "IDR",
  supportedCurrencies = ["IDR"],
  variant = "pill",
  className = "",
}: CurrencySelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  // If tenant only supports 1 currency or none, don't show the selector
  if (!supportedCurrencies || supportedCurrencies.length <= 1) {
    return null;
  }

  const activeConfig = CURRENCY_CONFIGS[currentCurrency] || CURRENCY_CONFIGS.IDR;

  // Filter supported currencies based on search query
  const filteredCurrencies = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return supportedCurrencies;

    return supportedCurrencies.filter((code) => {
      const cfg = CURRENCY_CONFIGS[code] || {
        code,
        fullName: code,
        label: code,
        symbol: "",
      };
      return (
        cfg.code.toLowerCase().includes(q) ||
        cfg.fullName.toLowerCase().includes(q) ||
        cfg.label.toLowerCase().includes(q) ||
        cfg.symbol.toLowerCase().includes(q)
      );
    });
  }, [supportedCurrencies, searchQuery]);

  // Reset highlight index and search when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      const currentIndex = supportedCurrencies.indexOf(currentCurrency);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, currentCurrency, supportedCurrencies]);

  // Handle selecting a currency
  const handleSelect = (code: Currency) => {
    // 1. Store in Cookie with 30-day expiry
    document.cookie = `storefront_currency=${code}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    setIsOpen(false);

    // 2. Refresh page to re-render Server Components with new currency
    router.refresh();
  };

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredCurrencies.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredCurrencies.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredCurrencies.length) % filteredCurrencies.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredCurrencies[highlightedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  };

  return (
    <>
      {/* 1. Trigger Button */}
      {variant === "sidebar-item" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 text-sm font-medium transition-colors border border-border/40 cursor-pointer ${className}`}
          title="Ganti Mata Uang"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">Mata Uang</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-white">
            <span className="text-muted-foreground font-mono">{activeConfig.symbol}</span>
            <span className="text-sm leading-none">{activeConfig.flag}</span>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#181a24]/90 hover:bg-[#202332] active:scale-95 border border-white/15 text-xs font-bold text-white transition-all shadow-md cursor-pointer group ${className}`}
          title="Ganti Mata Uang / Change Currency"
          aria-label="Pilih Mata Uang"
        >
          <span className="font-mono text-gray-300 group-hover:text-white transition-colors">{activeConfig.symbol}</span>
          <span className="text-base leading-none drop-shadow-sm">{activeConfig.flag}</span>
        </button>
      )}

      {/* 2. Spotlight Search Modal (macOS Spotlight / Command-Palette Style) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          showCloseButton={false} 
          className="sm:max-w-md w-[92vw] max-w-[440px] p-0 overflow-hidden bg-[#13151f]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] gap-0 outline-none"
        >
          <DialogTitle className="sr-only">Pilih Mata Uang</DialogTitle>
          {/* Header with Search Input */}
          <div className="flex items-center border-b border-white/10 px-4 py-3.5 gap-3 bg-white/[0.02]">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search Currency..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base text-white placeholder-gray-500 outline-none w-full font-medium"
              autoFocus
            />
            {searchQuery ? (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")} 
                className="text-gray-400 hover:text-white transition-colors p-0.5 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                ESC
              </kbd>
            )}
          </div>

          {/* List of Supported Currencies */}
          <div className="max-h-[340px] overflow-y-auto p-2 space-y-1.5">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((code, idx) => {
                const isSelected = currentCurrency === code;
                const isHighlighted = highlightedIndex === idx;
                const config = CURRENCY_CONFIGS[code] || {
                  code,
                  fullName: code,
                  label: code,
                  flag: "🌐",
                  symbol: "",
                };

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleSelect(code)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#4f38a7] text-white shadow-md shadow-indigo-950/40"
                        : isHighlighted
                        ? "bg-white/10 text-white"
                        : "hover:bg-white/5 text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 truncate">
                      {/* Circular Flag Icon */}
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white/10 border border-white/15 text-xl shrink-0 shadow-inner">
                        <span className="leading-none select-none">{config.flag}</span>
                      </div>

                      {/* Full Currency Name */}
                      <span className="truncate font-medium text-left">
                        {config.fullName || config.label}
                      </span>
                    </div>

                    {/* Active State Checkmark */}
                    {isSelected && (
                      <div className="flex items-center gap-1.5 pl-2 shrink-0">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400 space-y-1">
                <p className="text-sm font-medium">Mata uang tidak ditemukan</p>
                <p className="text-xs text-gray-500">Coba kata kunci pencarian lain</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
