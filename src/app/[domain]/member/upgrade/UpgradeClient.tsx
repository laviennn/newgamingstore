"use client";

import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { 
  Rocket, 
  Shield, 
  Crown, 
  Check, 
  LayoutGrid, 
  List, 
  MessageCircle, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  Wallet
} from "lucide-react";
import { useNotification } from "@/components/ui/notification";
import { createUpgradeOrder } from "@/components/storefront/upgradeActions";
import { useRouter } from "next/navigation";

// Hardcoded Starter Package (as requested by user)
const STARTER_PACKAGE = {
  id: "starter",
  name: "Starter",
  price: 0,
  priceDisplay: "Gratis",
  period_label: "",
  benefits: [
    "Harga Publik (Standar)",
    "Point Reward per Transaksi",
    "Metode Pembayaran Lengkap",
    "Customer Service via Chat",
    "Riwayat Transaksi 30 Hari",
  ],
};

function formatPriceDisplay(price: number, periodLabel: string) {
  if (price === 0) return "Gratis";
  if (price === 550000) return `550k ${periodLabel}`;
  if (price === 1500000) return `1,5 Juta ${periodLabel}`;
  return `Rp ${price.toLocaleString("id-ID")} ${periodLabel}`;
}

export function UpgradeClient({
  user,
  currentLevel,
  dynamicPackages,
  paymentChannels,
  tenantConfig,
}: {
  user: User;
  currentLevel: string;
  dynamicPackages: any[];
  paymentChannels: any[];
  tenantConfig: any;
}) {
  const { showNotification, NotificationComponent } = useNotification();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Try to find the next package based on current level, or default to first dynamic package
  const defaultPkgId = dynamicPackages.length > 0 
    ? (dynamicPackages.find(p => p.name.toUpperCase() !== currentLevel.toUpperCase())?.id || dynamicPackages[0].id)
    : null;

  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(defaultPkgId);
  
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    paymentChannels.length > 0 ? paymentChannels[0].id : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Wallet state
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  React.useEffect(() => {
    const fetchWallet = async () => {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      if (user?.email) {
        const { data } = await supabase.from('wallets').select('balance').eq('email', user.email.toLowerCase()).single();
        if (data) setWalletBalance(data.balance);
      }
    };
    fetchWallet();
  }, [user]);

  // Extract wallet channel and other channels
  const walletChannel = paymentChannels.find((pc: any) => pc.id === '11111111-1111-1111-1111-111111111111' || pc.account_number === 'WALLET');
  const otherChannels = paymentChannels.filter((pc: any) => pc.id !== '11111111-1111-1111-1111-111111111111' && pc.account_number !== 'WALLET');

  // Group payment channels by category
  const channelCategories = Array.from(new Set(otherChannels.map(c => c.category || "Transfer Bank")));

  const currentRole = currentLevel.toUpperCase();

  const allPackages = [
    STARTER_PACKAGE,
    ...dynamicPackages.map(pkg => ({
      ...pkg,
      priceDisplay: formatPriceDisplay(Number(pkg.price), pkg.period_label || "/Tahun"),
      benefits: Array.isArray(pkg.benefits) ? pkg.benefits : [],
    })),
  ];

  const activeSelectedPkg = allPackages.find(p => p.id === selectedPkgId) || allPackages[1] || STARTER_PACKAGE;

  const handleProcessUpgrade = async () => {
    if (activeSelectedPkg.id === "starter") {
      showNotification("info", "Informasi", "Anda sudah menggunakan paket Starter (Bawaan/Gratis).");
      return;
    }

    if (!selectedPaymentId) {
      showNotification("warning", "Pilih Pembayaran", "Harap pilih metode pembayaran terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createUpgradeOrder({
        packageName: activeSelectedPkg.name,
        amount: Number(activeSelectedPkg.price),
        paymentChannelId: selectedPaymentId,
        userEmail: user.email || "",
        waNumber: user.user_metadata?.phone || null,
      });

      if (res.success && res.invoiceId) {
        showNotification("success", "Invoice Dibuat", "Mengarahkan ke halaman invoice checkout...");
        router.push(`/deposit-checkout/${res.invoiceId}`);
      } else {
        showNotification("error", "Gagal", res.message || "Gagal membuat pesanan upgrade.");
      }
    } catch (err: any) {
      showNotification("error", "Kesalahan Sistem", err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSChat = () => {
    const waNumber = tenantConfig?.whatsapp?.replace(/[^0-9]/g, "") || "6281234567890";
    const message = encodeURIComponent("Halo Admin CS, saya mau bertanya mengenai Upgrade Membership.");
    window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white pt-10 pb-24 px-4 sm:px-6 relative">
      {NotificationComponent}

      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            SUBSCRIPTION
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Upgrade <span className="text-[#2B95FF]">Membership</span>
          </h1>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151515] border border-white/10 text-xs text-gray-300 font-medium">
            <span>Current Role:</span>
            <span className="font-bold text-white uppercase bg-white/10 px-2 py-0.5 rounded text-[10px] tracking-wider border border-white/10">
              {currentRole}
            </span>
          </div>
        </div>

        {/* Package Selection Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">PILIH PAKET</h2>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#151515] border border-white/10 p-1 rounded-xl gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[#2B95FF] text-white" : "text-gray-400 hover:text-white"}`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#2B95FF] text-white" : "text-gray-400 hover:text-white"}`}
                title="Tampilan List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cards Layout */}
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"}`}>
            {allPackages.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              const isStarter = pkg.id === "starter";

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`relative rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#0d1527]/90 border-2 border-[#2B95FF] shadow-[0_0_30px_rgba(43,149,255,0.2)]"
                      : "bg-[#121316] border border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#2B95FF] text-white flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  <div>
                    {/* Package Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                      isStarter ? "bg-white/5 border border-white/10 text-gray-300" : "bg-blue-600/20 border border-blue-500/30 text-[#2B95FF]"
                    }`}>
                      {isStarter ? <Rocket className="w-6 h-6" /> : (pkg.name.toLowerCase().includes("gold") ? <Crown className="w-6 h-6" /> : <Shield className="w-6 h-6" />)}
                    </div>

                    {/* Title & Price */}
                    <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                    <div className="mb-8">
                      <span className="text-2xl sm:text-3xl font-black text-white">{pkg.priceDisplay}</span>
                    </div>

                    {/* Benefits List */}
                    <ul className="space-y-3 text-sm text-gray-300">
                      {pkg.benefits.map((benefit: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isStarter ? "text-gray-500" : "text-[#2B95FF]"}`} />
                          <span className="text-xs sm:text-sm font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-gray-400">
                    <span>{isStarter ? "Bawaan Akun" : "Perpanjangan Otomatis"}</span>
                    <span className={isSelected ? "text-[#2B95FF]" : "text-gray-500"}>
                      {isSelected ? "Terpilih" : "Pilih Paket"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Channels Section */}
        {activeSelectedPkg.id !== "starter" && (
          <div className="space-y-6 pt-6 border-t border-white/10">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">METODE PEMBAYARAN</h2>

            {/* Wallet Payment Channel (Khusus Member) */}
            {walletChannel && (
              <div className="mb-6 pb-6 border-b border-white/10">
                {(() => {
                  const channel = walletChannel;
                  const isChannelSelected = selectedPaymentId === channel.id;
                  const isWalletInsufficient = walletBalance === null || walletBalance < Number(activeSelectedPkg.price);
                  const isDisabled = isWalletInsufficient;

                  return (
                    <div
                      key={channel.id}
                      onClick={() => {
                        if (isDisabled) return;
                        setSelectedPaymentId(channel.id);
                      }}
                      className={`relative p-4 rounded-2xl border transition-all flex items-center justify-between overflow-hidden ${
                        isDisabled 
                          ? "opacity-50 cursor-not-allowed bg-[#121316] border-transparent" 
                          : isChannelSelected
                            ? "bg-blue-600/10 border-[#2B95FF] text-white shadow-md shadow-blue-900/20 cursor-pointer"
                            : "bg-[#121316] border-[#2B95FF]/30 hover:border-[#2B95FF]/60 text-gray-300 cursor-pointer"
                      }`}
                    >
                      {/* Badge Khusus Member */}
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-lg z-10 tracking-widest uppercase">
                        Khusus Member
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                          {channel.code ? (
                            <span className="text-xs font-black text-blue-400 uppercase">{channel.code}</span>
                          ) : (
                            <Wallet className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{channel.name}</p>
                          <p className={`text-[10px] font-bold mt-0.5 ${isWalletInsufficient ? 'text-red-400' : 'text-green-400'}`}>
                            Saldo: Rp {(walletBalance || 0).toLocaleString('id-ID')}
                            {isWalletInsufficient && ` (Kurang Rp ${(Number(activeSelectedPkg.price) - (walletBalance || 0)).toLocaleString('id-ID')})`}
                          </p>
                        </div>
                      </div>
                      {isChannelSelected && !isDisabled && <CheckCircle2 className="w-5 h-5 text-[#2B95FF] shrink-0" />}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="space-y-6">
              {channelCategories.map((category) => {
                const categoryChannels = otherChannels.filter(c => (c.category || "Transfer Bank") === category);
                if (categoryChannels.length === 0) return null;

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{category}</h3>
                      {category === "QRIS" && (
                        <span className="text-[9px] bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full font-bold">
                          Bebas Biaya Admin
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {categoryChannels.map((channel) => {
                        const isChannelSelected = selectedPaymentId === channel.id;
                        
                        return (
                          <div
                            key={channel.id}
                            onClick={() => setSelectedPaymentId(channel.id)}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                              isChannelSelected
                                ? "bg-blue-600/10 border-[#2B95FF] text-white shadow-md shadow-blue-900/20"
                                : "bg-[#121316] border-white/10 hover:border-white/20 text-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                                {channel.code ? (
                                  <span className="text-xs font-black text-blue-400 uppercase">{channel.code}</span>
                                ) : (
                                  <Wallet className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-white">{channel.name}</p>
                                <p className="text-[10px] text-gray-400">Proses Otomatis</p>
                              </div>
                            </div>
                            {isChannelSelected && <CheckCircle2 className="w-5 h-5 text-[#2B95FF] shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Process Button */}
        {activeSelectedPkg.id !== "starter" && (
          <div className="pt-6 flex justify-end">
            <button
              onClick={handleProcessUpgrade}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-[280px] bg-[#2B95FF] hover:bg-[#1E74D4] text-white font-bold text-base px-8 py-4 rounded-2xl transition-all shadow-[0_0_25px_rgba(43,149,255,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses Invoice...</span>
                </>
              ) : (
                <>
                  <span>Proses Upgrade Sekarang</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {/* Floating Chat CS Button */}
      <button
        onClick={handleCSChat}
        className="fixed bottom-6 right-6 z-40 bg-[#2B95FF] hover:bg-[#1E74D4] text-white font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-transform active:scale-95 border border-white/20 text-xs tracking-wider"
      >
        <MessageCircle className="w-4 h-4 fill-current" />
        <span>CHAT CS</span>
      </button>

    </div>
  );
}
