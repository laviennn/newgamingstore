"use client";

import React, { useState } from "react";
import Image from "next/image";
import { DynamicFieldBuilder } from "@/components/storefront/DynamicFieldBuilder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, ShoppingCart, ChevronDown, ChevronUp, Ticket, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { validatePromoCode, getAvailablePromos } from "@/components/storefront/promoActions";
import { createOrder } from "@/components/storefront/checkoutActions";
import { checkUsername } from "@/app/actions/usernameValidator";
import { useNotification } from "@/components/ui/notification";

// Helper for angled number badge
const NumberBadge = ({ num }: { num: number }) => (
  <div className="relative flex items-center justify-center w-10 h-10 overflow-hidden rounded-l-md rounded-br-2xl bg-gradient-to-br from-blue-700 to-blue-900 shrink-0 transform -skew-x-12 ml-2 border border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
    <span className="text-white font-black italic text-lg transform skew-x-12">{num}</span>
  </div>
);

export function StorefrontGameForm({
  game,
  products,
  paymentChannels,
  themeConfig
}: {
  game: any,
  products: any[],
  paymentChannels: any[],
  themeConfig: any
}) {
  const { showNotification, NotificationComponent } = useNotification();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Variant State
  const variants = Array.from(new Set(products.map(p => p.variant_type).filter(Boolean))) as string[];
  const hasVariants = variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<string | null>(variants.length > 0 ? variants[0] : null);

  const [waNumber, setWaNumber] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [promoMessage, setPromoMessage] = useState("");
  const [isPromoChecking, setIsPromoChecking] = useState(false);
  const [availablePromos, setAvailablePromos] = useState<any[]>([]);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Modal Checkout States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [validatedUsername, setValidatedUsername] = useState<string | null>(null);
  const [usernameWarning, setUsernameWarning] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<{ label: string, value: string }[]>([]);

  // Wallet state
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchWallet = async () => {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const { data } = await supabase.from('wallets').select('balance').eq('email', session.user.email.toLowerCase()).single();
        if (data) setWalletBalance(data.balance);
      }
    };
    fetchWallet();
  }, []);

  const handleCheckPromo = async () => {
    setIsPromoChecking(true);
    setPromoMessage("");
    try {
      const res = await validatePromoCode(promoCodeInput);
      if (res.success) {
        setAppliedPromo(res.promo);
        setPromoMessage(`Berhasil! Diskon diterapkan.`);
      } else {
        setAppliedPromo(null);
        setPromoMessage(res.message || "Kode promo tidak valid.");
      }
    } catch (e) {
      setPromoMessage("Terjadi kesalahan sistem.");
    } finally {
      setIsPromoChecking(false);
    }
  };

  const handleOpenPromoModal = async () => {
    setIsPromoModalOpen(true);
    const promos = await getAvailablePromos();
    setAvailablePromos(promos);
  };

  let totalPrice = selectedProduct ? selectedProduct.price : 0;
  if (appliedPromo && selectedProduct) {
    if (appliedPromo.discount_type === 'percentage') {
      totalPrice = totalPrice - (totalPrice * (appliedPromo.discount_value / 100));
    } else {
      totalPrice = totalPrice - appliedPromo.discount_value;
    }
    if (totalPrice < 0) totalPrice = 0;
  }

  // Extract wallet channel and other channels
  const walletChannel = paymentChannels.find((pc: any) => pc.id === '11111111-1111-1111-1111-111111111111' || pc.account_number === 'WALLET');
  const otherChannels = paymentChannels.filter((pc: any) => pc.id !== '11111111-1111-1111-1111-111111111111' && pc.account_number !== 'WALLET');

  // Group other payment channels by category
  const groupedPayments = otherChannels.reduce((acc: any, curr: any) => {
    const cat = curr.category || 'Lainnya';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  // Helper removed from here

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedPayment) return;

    // Extract form data to show in modal
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data: { label: string, value: string }[] = [];
    let userId = "";
    let serverId = "";

    if (game.form_fields && Array.isArray(game.form_fields)) {
      game.form_fields.forEach((field: any, idx: number) => {
        const val = formData.get(field.name);
        if (val) {
          const valStr = val.toString().trim();
          data.push({ label: field.label, value: valStr });

          const nameLower = (field.name || "").toLowerCase();
          const labelLower = (field.label || "").toLowerCase();

          // Deteksi Server / Zone
          if (
            nameLower.includes('server') || nameLower.includes('zone') || nameLower === 'zoneid' || nameLower === 'serverid' ||
            labelLower.includes('server') || labelLower.includes('zone')
          ) {
            serverId = valStr;
          }
          // Deteksi User ID / Open ID / Target ID
          else if (
            nameLower.includes('user') || nameLower.includes('id') || nameLower.includes('target') || nameLower.includes('account') || nameLower.includes('open') ||
            labelLower.includes('id') || labelLower.includes('user') || labelLower.includes('open')
          ) {
            if (!userId) userId = valStr;
          }
          // Fallback: Jika field pertama, dan userId belum terisi
          else if (idx === 0 && !userId) {
            userId = valStr;
          }
        }
      });

      // Fallback 2: Jika userId masih belum terisi, pakai field pertama
      if (!userId && data.length > 0) {
        userId = data[0].value;
      }
    }

    setAccountData(data);
    setValidatedUsername(null);
    setUsernameWarning(null);

    if (game.has_username_validator) {
      setIsCheckingUsername(true);
      try {
        const gameCode = game.validator_game_code || game.slug || "";
        const res = await checkUsername(userId, serverId, gameCode, game.validator_provider);
        if (res.success && res.username) {
          setValidatedUsername(res.username);
        } else {
          setUsernameWarning(res.message || "Username tidak ditemukan atau gagal memvalidasi data ID & Server.");
        }
      } catch (err) {
        setUsernameWarning("Terjadi kesalahan sistem saat memvalidasi username. Pastikan ID & Server benar.");
      } finally {
        setIsCheckingUsername(false);
      }
    }

    setIsConfirmModalOpen(true);
  };

  const confirmCheckout = async () => {
    setIsSubmitting(true);

    // Construct order data
    const orderData = {
      tenantName: themeConfig?.siteName || "NewGamingStore",
      gameId: game.id,
      productId: selectedProduct.id,
      productPrice: selectedProduct.price,
      paymentMethodId: selectedPayment.id,
      tenantId: game.tenant_id,
      accountData: (() => {
        const accObj = accountData.reduce((acc: any, curr: any) => {
          acc[curr.label] = curr.value;
          return acc;
        }, {});
        if (validatedUsername) {
          accObj["Username"] = validatedUsername;
        }
        return accObj;
      })(),
      promo: appliedPromo,
      waNumber: waNumber,
    };

    const res = await createOrder(orderData);
    if (res.success) {
      window.location.href = `/checkout/${res.invoiceId}`;
    } else {
      showNotification("error", "Gagal Membuat Pesanan", res.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-6 lg:mt-6 w-full relative pb-36 md:pb-0">
      {NotificationComponent}
      {/* 1. Account Detail */}
      <div className="border border-border/40 shadow-xl overflow-hidden rounded-xl bg-[#111111]">
        <div className="border-b border-border/30 bg-[#0a0a0a] p-4 relative">
          <div className="absolute top-0 left-0 bottom-0 w-[5px] bg-blue-600 rounded-l-xl"></div>
          <div className="flex items-center gap-4 pl-3">
            <NumberBadge num={1} />
            <h2 className="text-lg font-bold text-white tracking-wide">Masukkan Data Akun Kamu</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <DynamicFieldBuilder fields={game.form_fields || []} />

          {/* Panduan Modal - Moved to bottom of section 1 */}
          {game.guide_image_url && (
            <Dialog>
              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg w-fit h-10 px-4 mt-2 transition-colors">
                <Info className="w-4 h-4 mr-2" /> Lihat Panduan Pengisian
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-primary/20">
                <DialogHeader>
                  <DialogTitle className="font-bold text-xl">Panduan Pengisian</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="relative w-full h-[250px] rounded-xl overflow-hidden border-2 border-border bg-black/20">
                    <Image src={game.guide_image_url} alt="Panduan" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
                  </div>
                  {game.guide_text && (
                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <p className="text-sm font-semibold text-white whitespace-pre-line">{game.guide_text}</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* 2. Nominal Top Up */}
      <div className="border border-border/40 shadow-xl overflow-hidden rounded-xl bg-[#111111]">
        <div className="border-b border-border/30 bg-[#0a0a0a] p-4 relative">
          <div className="absolute top-0 left-0 bottom-0 w-[5px] bg-blue-600 rounded-l-xl"></div>
          <div className="flex items-center gap-4 pl-3">
            <NumberBadge num={2} />
            <h2 className="text-lg font-bold text-white tracking-wide">Pilih Nominal Top Up</h2>
          </div>
        </div>

        <div className="p-6">
          {hasVariants && (
            <div className="flex flex-wrap items-center gap-2 mb-6 bg-[#0a0a0a] p-1.5 rounded-xl border border-border/20 w-fit">
              {variants.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setSelectedVariant(v);
                    setSelectedProduct(null); // Reset product selection on tab change
                  }}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${selectedVariant === v ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          {(() => {
            const displayProducts = hasVariants && selectedVariant
              ? products.filter((p: any) => p.variant_type === selectedVariant)
              : products;

            return displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayProducts.map((p: any) => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`rounded-xl overflow-hidden cursor-pointer transition-all border-2 flex flex-col justify-between group ${isSelected ? 'border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] bg-blue-500/10' : 'border-border/30 bg-[#1c1d21] hover:border-blue-500/50 hover:bg-[#25262b]'}`}
                    >
                      {/* Top Grey Area */}
                      <div className={`p-4 flex flex-col items-center justify-center flex-1 transition-colors ${isSelected ? 'bg-transparent' : 'bg-[#313338]/50 group-hover:bg-transparent'}`}>
                        <p className="font-bold text-sm text-center line-clamp-2 text-white/90 mb-3 leading-snug">{p.name}</p>

                        {/* 3D Product Image */}
                        {p.image_url ? (
                          <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mt-auto" style={{ perspective: '800px' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-contain filter drop-shadow-xl"
                              style={{ transform: 'rotateY(20deg) rotateX(-4deg)', transformOrigin: 'left center' }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 mt-auto">
                            <ShoppingCart className="w-6 h-6 text-blue-400" />
                          </div>
                        )}
                      </div>

                      {/* Bottom Dark Area */}
                      <div className={`p-3 text-center border-t border-border/20 ${isSelected ? 'bg-blue-600' : 'bg-[#151618] group-hover:bg-[#1a1b1e]'}`}>
                        <p className="text-xs text-white/50 mb-0.5">Harga</p>
                        <p className={`font-extrabold text-sm md:text-base ${isSelected ? 'text-white' : 'text-white'}`}>
                          Rp {p.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl border-border/20 bg-black/20">
                <p>Belum ada produk top-up yang tersedia.</p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 3. Metode Pembayaran */}
      <div className="border border-border/40 shadow-xl overflow-hidden rounded-xl bg-[#111111]">
        <div className="border-b border-border/30 bg-[#0a0a0a] p-4 relative">
          <div className="absolute top-0 left-0 bottom-0 w-[5px] bg-blue-600 rounded-l-xl"></div>
          <div className="flex items-center gap-4 pl-3">
            <NumberBadge num={3} />
            <h2 className="text-lg font-bold text-white tracking-wide">Pilih Pembayaran</h2>
          </div>
        </div>

        <div className="p-4 space-y-4 bg-[#111111]">
          {/* Info Box */}

          {/* Wallet Payment Channel (Khusus Member) */}
          {walletChannel && (
            <div className="mb-4">
              {(() => {
                const pc = walletChannel;
                const isSelected = selectedPayment?.id === pc.id;
                const isWalletInsufficient = walletBalance === null || walletBalance < totalPrice;
                const isDisabled = isWalletInsufficient;

                return (
                  <div
                    key={pc.id}
                    onClick={() => {
                      if (isDisabled) return;
                      setSelectedPayment(pc);
                    }}
                    className={`relative rounded-xl border-2 transition-all overflow-hidden ${isDisabled ? 'opacity-50 cursor-not-allowed border-transparent bg-[#25262b]' : 'cursor-pointer'} ${isSelected && !isDisabled ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : !isDisabled ? 'border-blue-500/30 bg-[#25262b] hover:border-blue-500/60 hover:bg-[#2a2b30]' : ''}`}
                  >
                    {/* Tooltip / Badge */}
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-lg z-10 tracking-widest uppercase">
                      Khusus Member
                    </div>
                    {/* Primary Row */}
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-16 h-10 rounded-md bg-white relative shrink-0 p-1 shadow-sm flex items-center justify-center">
                        {pc.logo_url ? (
                          <Image src={pc.logo_url} alt={pc.name} fill sizes="64px" className="object-contain p-1" />
                        ) : (
                          <span className="text-xs text-black font-bold">LOGO</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm md:text-base text-white/95">{pc.name}</p>
                        {selectedProduct && (
                          <p className="text-sm font-semibold text-blue-400 mt-1">Rp {totalPrice.toLocaleString('id-ID')}</p>
                        )}
                        <p className={`text-xs mt-1 font-bold ${isWalletInsufficient ? 'text-red-400' : 'text-green-400'}`}>
                          Saldo Anda: Rp {(walletBalance || 0).toLocaleString('id-ID')}
                          {isWalletInsufficient && ` (Kurang Rp ${(totalPrice - (walletBalance || 0)).toLocaleString('id-ID')})`}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-blue-500' : 'border-muted-foreground'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {Object.keys(groupedPayments).length > 0 ? (
            <div className="space-y-4">
              {Object.keys(groupedPayments).map((category) => {
                const isOpen = openCategory === category;
                const items = groupedPayments[category];

                return (
                  <div key={category} className="rounded-xl overflow-hidden shadow-md border border-border/30 bg-[#1c1d21]">
                    {/* Accordion Header */}
                    <div
                      onClick={() => setOpenCategory(isOpen ? null : category)}
                      className="bg-blue-600 p-4 cursor-pointer flex items-center justify-between transition-colors hover:bg-blue-700"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base md:text-lg tracking-wide">{category}</h3>
                        {category === "QRIS" && (
                          <span className="text-[10px] md:text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold">
                            Bebas Biaya Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {!isOpen && (
                          <div className="flex items-center gap-1.5 hidden sm:flex">
                            {items.slice(0, 4).map((item: any) => (
                              <div key={item.id} className="w-9 h-6 bg-white rounded flex items-center justify-center overflow-hidden p-0.5">
                                {item.logo_url && <Image src={item.logo_url} alt="" width={32} height={20} className="object-contain" />}
                              </div>
                            ))}
                            {items.length > 4 && <span className="text-xs font-bold text-white/90 ml-1">+{items.length - 4}</span>}
                          </div>
                        )}
                        {isOpen ? <ChevronUp className="text-white w-6 h-6" /> : <ChevronDown className="text-white w-6 h-6" />}
                      </div>
                    </div>

                    {/* Accordion Body */}
                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="p-3 space-y-3">
                          {items.map((pc: any) => {
                            const isSelected = selectedPayment?.id === pc.id;

                            return (
                              <div
                                key={pc.id}
                                onClick={() => setSelectedPayment(pc)}
                                className={`rounded-xl border-2 transition-all overflow-hidden cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'border-transparent bg-[#25262b] hover:border-blue-500/40 hover:bg-[#2a2b30]'}`}
                              >
                                {/* Primary Row */}
                                <div className="p-4 flex items-center gap-4">
                                  <div className="w-16 h-10 rounded-md bg-white relative shrink-0 p-1 shadow-sm flex items-center justify-center">
                                    {pc.logo_url ? (
                                      <Image src={pc.logo_url} alt={pc.name} fill sizes="64px" className="object-contain p-1" />
                                    ) : (
                                      <span className="text-xs text-black font-bold">LOGO</span>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-sm md:text-base text-white/95">{pc.name}</p>
                                    {selectedProduct && (
                                      <p className="text-sm font-semibold text-blue-400 mt-1">Rp {totalPrice.toLocaleString('id-ID')}</p>
                                    )}
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-blue-500' : 'border-muted-foreground'}`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                  </div>
                                </div>

                                {/* Details Info (Shown only when selected) */}
                                {isSelected && (pc.account_name || pc.account_number) && (
                                  <div className="bg-[#1a1b1e] p-4 border-t border-border/10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      {pc.account_name && (
                                        <div>
                                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">A.N (Atas Nama)</p>
                                          <p className="font-bold text-white/90 text-sm">{pc.account_name}</p>
                                        </div>
                                      )}
                                      {pc.account_number && (
                                        <div>
                                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Nomor Rekening</p>
                                          <p className="font-mono font-bold text-blue-400 text-sm bg-blue-500/10 w-fit px-2 py-0.5 rounded">{pc.account_number}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-xl border-border/20 bg-black/20">
              <p>Belum ada metode pembayaran yang tersedia.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Detail Kontak */}
      <div className="border border-border/40 shadow-xl overflow-hidden rounded-xl bg-[#111111]">
        <div className="border-b border-border/30 bg-[#0a0a0a] p-4 relative">
          <div className="absolute top-0 left-0 bottom-0 w-[5px] bg-blue-600 rounded-l-xl"></div>
          <div className="flex items-center gap-4 pl-3">
            <NumberBadge num={4} />
            <h2 className="text-lg font-bold text-white tracking-wide">Detail Kontak</h2>
          </div>
        </div>
        <div className="p-4 bg-[#111111]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">No. WhatsApp</label>
            <div className="flex items-center rounded-xl bg-[#d1d5db] overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <div className="flex items-center justify-center px-4 border-r border-gray-400 bg-[#d1d5db]">
                <span className="text-xl">🇮🇩</span>
              </div>
              <input
                type="tel"
                required
                pattern="^(08|62|\+62)\d{8,13}$"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                placeholder="628"
                className="flex h-12 flex-1 border-none bg-transparent px-4 py-2 text-sm text-black placeholder:text-gray-600 font-medium focus-visible:outline-none"
              />
            </div>
            <p className="text-[11px] text-muted-foreground italic mt-1">
              *Contoh: 62821xxxxxxxxx (No WhatsApp wajib diisi)
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#eef2ff] px-3 py-2.5 border border-blue-200 shadow-sm">
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-sm text-blue-800 font-medium">
                <span className="font-bold">Informasi:</span> Bukti transaksi akan kami kirim ke WhatsApp atau email yang kamu isi di atas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Kode Promo */}
      <div className="border border-border/40 shadow-xl overflow-hidden rounded-xl bg-[#111111]">
        <div className="border-b border-border/30 bg-[#0a0a0a] p-4 relative">
          <div className="absolute top-0 left-0 bottom-0 w-[5px] bg-blue-600 rounded-l-xl"></div>
          <div className="flex items-center gap-4 pl-3">
            <NumberBadge num={5} />
            <h2 className="text-lg font-bold text-white tracking-wide">Kode Promo</h2>
          </div>
        </div>
        <div className="p-4 bg-[#111111]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Kode Promo</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="Masukkan Kode Promo Anda"
                  className="flex h-12 flex-1 rounded-xl border-none bg-[#d1d5db] px-4 py-2 text-sm text-black placeholder:text-gray-600 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 uppercase"
                />
                <Button type="button" onClick={handleCheckPromo} disabled={!promoCodeInput || isPromoChecking} className="bg-blue-700 hover:bg-blue-800 text-white font-bold h-12 px-6 rounded-xl shrink-0 transition-colors">
                  {isPromoChecking ? 'Cek...' : 'Gunakan'}
                </Button>
              </div>
            </div>
            {promoMessage && (
              <p className={`text-sm font-medium ${appliedPromo ? 'text-green-500' : 'text-red-500'}`}>
                {promoMessage}
              </p>
            )}
            <Button type="button" onClick={handleOpenPromoModal} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold h-11 px-5 rounded-xl flex items-center gap-2 w-fit transition-colors shadow-lg">
              <Ticket className="w-5 h-5" /> Cek Promo Yang Tersedia
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Summary Order */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-[#0f0f11]/95 backdrop-blur-md border-t border-border/40 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] md:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {selectedProduct ? (
              <>
                <p className="text-[11px] font-medium text-white/90 truncate mb-0.5">{selectedProduct.name}</p>
                <div className="flex items-baseline gap-2">
                  {appliedPromo && (
                    <p className="text-[10px] font-bold text-muted-foreground line-through decoration-red-500">
                      Rp {selectedProduct.price.toLocaleString('id-ID')}
                    </p>
                  )}
                  <p className="text-sm font-black text-blue-400">Rp {totalPrice.toLocaleString('id-ID')}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingCart className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-xs font-medium text-white/70">Pilih Nominal & Pembayaran</p>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={!selectedProduct || !selectedPayment || isCheckingUsername}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 h-10 text-xs rounded-xl shadow-lg shadow-blue-600/30 shrink-0 disabled:opacity-50"
          >
            {isCheckingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pesan Sekarang!"}
          </Button>
        </div>
      </div>

      {/* Desktop Sticky Summary Order */}
      <div className="hidden md:flex flex-col sticky bottom-6 z-40 mt-6 gap-3">
        {selectedProduct ? (
          <>
            <div className="bg-[#0a0a0a] border border-dashed border-border/40 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
              {game.image_url && (
                <div className="w-16 h-16 relative shrink-0 rounded-xl overflow-hidden border border-border/20 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={game.image_url} alt="game cover" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-bold text-white text-base mb-1">{game.name}</p>
                <div className="flex items-center text-sm font-semibold mb-1">
                  {appliedPromo && (
                    <span className="text-muted-foreground line-through decoration-red-500 mr-2 text-xs">Rp. {selectedProduct.price.toLocaleString('id-ID')}</span>
                  )}
                  <span className="text-[#facc15]">Rp. {totalPrice.toLocaleString('id-ID')}</span>
                  <span className="text-white mx-2">-</span>
                  <span className="text-white">{selectedPayment?.name || "Pilih Pembayaran"}</span>
                </div>
                <p className="text-xs text-muted-foreground italic">**Waktu proses instan</p>
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!selectedProduct || !selectedPayment || isCheckingUsername}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold h-12 text-base rounded-xl transition-all shadow-lg"
            >
              {isCheckingUsername ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShoppingCart className="w-5 h-5 mr-2" />}
              {isCheckingUsername ? "Mengecek..." : "Pesan Sekarang!"}
            </Button>
          </>
        ) : (
          <div className="bg-[#0a0a0a] border border-dashed border-border/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-xl">
            <ShoppingCart className="w-8 h-8 text-muted-foreground opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">Silakan pilih nominal Top Up dan Pembayaran terlebih dahulu.</p>
          </div>
        )}
      </div>

      <Dialog open={isPromoModalOpen} onOpenChange={setIsPromoModalOpen}>
        <DialogContent className="bg-[#111111] border-border/40 text-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Promo Tersedia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {availablePromos.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Tidak ada promo yang tersedia saat ini.</p>
            ) : (
              availablePromos.map(p => (
                <div key={p.code} className="border border-border/40 rounded-xl p-4 bg-[#1a1b1e] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-blue-400 text-lg">{p.code}</p>
                    <p className="text-sm text-white/80">
                      Diskon {p.discount_type === 'percentage' ? `${p.discount_value}%` : `Rp ${p.discount_value.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                  <Button type="button" size="sm" onClick={() => {
                    setPromoCodeInput(p.code);
                    setIsPromoModalOpen(false);
                  }} className="bg-blue-600 hover:bg-blue-700 text-xs">Pilih</Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="bg-[#1c1d21] border-border/20 text-white sm:max-w-md p-0 overflow-hidden">
          <div className="p-6 flex flex-col items-center text-center pb-4">
            <div className="w-16 h-16 bg-[#0fa770] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#0fa770]/20">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2 tracking-wide">Buat Pesanan</h2>
            <p className="text-sm text-white/80">
              Pastikan data akun Anda dan produk yang Anda pilih valid dan sesuai.
            </p>
          </div>

          <div className="px-6 pb-6">
            <div className="bg-[#4d4d4d]/30 rounded-2xl p-5 space-y-6">
              {/* Data Player */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-white rounded-full"></div>
                  <h3 className="font-bold text-white text-base">Data Player</h3>
                </div>
                <div className="space-y-2">
                  {accountData.map((data, idx) => (
                    <div key={idx} className="flex items-start justify-between text-sm">
                      <span className="text-white/70">{data.label}</span>
                      <span className="font-bold text-white text-right max-w-[60%] truncate">{data.value}</span>
                    </div>
                  ))}

                  {validatedUsername && (
                    <div className="flex items-start justify-between text-sm pt-2 border-t border-white/10">
                      <span className="text-green-400 font-bold">Username Game</span>
                      <span className="font-extrabold text-green-300 text-right max-w-[60%] truncate">
                        {typeof validatedUsername === 'string' ? validatedUsername : String(validatedUsername)}
                      </span>
                    </div>
                  )}

                  {usernameWarning && (
                    <div className="mt-2 bg-amber-500/15 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-300 font-medium leading-relaxed">
                        <span className="font-bold block text-amber-200 mb-0.5">Peringatan Validasi Username:</span>
                        {usernameWarning}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ringkasan Pembelian */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-white rounded-full"></div>
                  <h3 className="font-bold text-white text-base">Ringkasan Pembelian</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-white/70">Item</span>
                    <span className="font-bold text-white text-right max-w-[60%]">{selectedProduct?.name}</span>
                  </div>
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-white/70">Product</span>
                    <span className="font-bold text-white text-right max-w-[60%] truncate">{game.name}</span>
                  </div>
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-white/70">Price</span>
                    <span className="font-bold text-white text-right max-w-[60%]">Rp. {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-white/70">Payment</span>
                    <span className="font-bold text-white text-right max-w-[60%] uppercase">{selectedPayment?.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button
                type="button"
                onClick={confirmCheckout}
                disabled={isSubmitting}
                className="bg-[#4caf50] hover:bg-[#43a047] text-white font-bold h-12 rounded-xl text-base"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pesan Sekarang'}
              </Button>
              <Button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="bg-[#f44336] hover:bg-[#e53935] text-white font-bold h-12 rounded-xl text-base"
              >
                Batalkan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </form>
  );
}
