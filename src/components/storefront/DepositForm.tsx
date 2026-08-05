"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2, Wallet } from "lucide-react";
import { createDepositOrder } from "@/components/storefront/depositActions";
import { useNotification } from "@/components/ui/notification";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const NOMINAL_OPTIONS = [
  10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000
];

export function DepositForm({
  paymentChannels,
  waNumber,
  tenantId,
}: {
  paymentChannels: any[];
  waNumber: string;
  tenantId?: string;
}) {
  const { showNotification, NotificationComponent } = useNotification();
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null);
  const [customNominal, setCustomNominal] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  
  // Checkout States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amount = selectedNominal || (customNominal ? parseInt(customNominal.replace(/[^0-9]/g, "")) : 0) || 0;

  // Group payment channels by category
  const groupedPayments = paymentChannels.reduce((acc: any, curr: any) => {
    const cat = curr.category || 'Lainnya';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const NumberBadge = ({ num }: { num: number }) => (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
      <span className="text-blue-400 font-bold text-sm">{num}</span>
    </div>
  );

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 10000) {
      showNotification("error", "Nominal Terlalu Kecil", "Minimal deposit adalah Rp 10.000");
      return;
    }
    if (!selectedPayment) {
      showNotification("error", "Pilih Pembayaran", "Silakan pilih metode pembayaran terlebih dahulu");
      return;
    }
    
    setIsConfirmModalOpen(true);
  };

  const confirmCheckout = async () => {
    setIsSubmitting(true);
    
    const depositData = {
      paymentMethodId: selectedPayment.id,
      waNumber: waNumber,
      amount: amount,
      tenantId: tenantId,
    };

    const res = await createDepositOrder(depositData);
    if (res.success) {
       window.location.href = `/deposit-checkout/${res.invoiceId}`;
    } else {
       showNotification("error", "Gagal Membuat Permohonan", res.message);
       setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-6 w-full relative pb-24 lg:pb-0">
      {NotificationComponent}
      
      {/* 1. Pilih Nominal */}
      <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
        <div className="border-b border-white/5 bg-[#161616] p-5">
          <div className="flex items-center gap-3">
            <NumberBadge num={1} />
            <h2 className="text-lg font-bold text-white tracking-wide">Pilih Nominal Deposit</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {NOMINAL_OPTIONS.map((nom) => {
              const isSelected = selectedNominal === nom;
              return (
                <div
                  key={nom}
                  onClick={() => { setSelectedNominal(nom); setCustomNominal(""); }}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 group
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                      : 'border-white/10 bg-[#151515] hover:border-white/30 hover:bg-[#1a1a1a]'}`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-0.5 shadow-lg shadow-blue-500/50 z-10 animate-scale-in">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <Wallet className={`w-6 h-6 ${isSelected ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400 transition-colors'}`} />
                  <div className="text-center">
                    <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      Rp {nom.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-gray-300">Atau Masukkan Nominal Khusus (Min. Rp 10.000)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
              <input
                type="text"
                placeholder="Contoh: 150000"
                value={customNominal}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9]/g, "");
                  if (val.startsWith("0")) val = val.substring(1);
                  setCustomNominal(val ? parseInt(val).toLocaleString('id-ID') : "");
                  setSelectedNominal(null);
                }}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pilih Pembayaran */}
      <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
        <div className="border-b border-white/5 bg-[#161616] p-5">
          <div className="flex items-center gap-3">
            <NumberBadge num={2} />
            <h2 className="text-lg font-bold text-white tracking-wide">Pilih Pembayaran</h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {Object.keys(groupedPayments).map((category, idx) => {
            const isOpen = openCategory === category || (idx === 0 && openCategory === null);
            return (
              <div key={category} className="border border-white/10 rounded-2xl overflow-hidden bg-[#151515]">
                <button
                  type="button"
                  onClick={() => setOpenCategory(isOpen ? null : category)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white uppercase tracking-wide text-sm">{category}</h3>
                    {category === "QRIS" && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold">
                        Bebas Biaya Admin
                      </span>
                    )}
                  </div>
                  <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#121212]">
                    {groupedPayments[category].map((payment: any) => {
                      const isSelected = selectedPayment?.id === payment.id;
                      return (
                        <div
                          key={payment.id}
                          onClick={() => setSelectedPayment(payment)}
                          className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4
                            ${isSelected 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : 'border-white/5 bg-[#151515] hover:border-white/20'}`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 text-blue-500">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          )}
                          <div className="w-16 h-10 relative bg-white rounded flex items-center justify-center p-1 overflow-hidden shrink-0">
                            {payment.logo_url ? (
                              <Image src={payment.logo_url} alt={payment.name} fill sizes="64px" className="object-contain" />
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400 text-center uppercase">{payment.name}</span>
                            )}
                          </div>
                          <div>
                            <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                              {payment.name}
                            </div>
                            <div className="text-xs text-emerald-400 font-medium">Bebas Biaya</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Checkout Button for Mobile, Fixed bottom for Desktop */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/10 z-50 lg:relative lg:p-0 lg:bg-transparent lg:border-none lg:mt-6">
        <button
          type="submit"
          disabled={amount < 10000 || !selectedPayment || isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-[#1a1a1a] disabled:text-gray-500 text-white font-bold text-lg py-4 rounded-full shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              Lanjutkan Pembayaran
              <span className="bg-black/20 px-3 py-1 rounded-full text-sm font-black">
                Rp {amount.toLocaleString('id-ID')}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#121212] border-white/10 p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900/40 to-[#121212] p-6 border-b border-white/10">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Konfirmasi Deposit</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-400 mt-2">Pastikan data berikut sudah benar sebelum melanjutkan.</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-3">
               <div className="flex justify-between items-center py-2 border-b border-white/5">
                 <span className="text-gray-400 text-sm">Nominal Deposit</span>
                 <span className="text-white font-bold">Rp {amount.toLocaleString('id-ID')}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-white/5">
                 <span className="text-gray-400 text-sm">Metode Pembayaran</span>
                 <span className="text-blue-400 font-bold">{selectedPayment?.name}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-white/5">
                 <span className="text-gray-400 text-sm">Nomor WhatsApp</span>
                 <span className="text-white font-medium">{waNumber || "-"}</span>
               </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmCheckout}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses
                  </>
                ) : (
                  "Proses Deposit"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
