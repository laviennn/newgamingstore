"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  CreditCard, 
  Cpu, 
  CheckCircle2, 
  Download,
  Copy,
  ChevronDown,
  Navigation,
  Check,
  UploadCloud,
  MessageCircle,
  Loader2
} from "lucide-react";
import { uploadFile } from "@/app/actions/upload";
import { updatePaymentProof } from "@/components/storefront/checkoutActions";
import { useNotification } from "@/components/ui/notification";

export function CheckoutClient({ order, tenantConfig }: { order: any, tenantConfig: any }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number} | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState(order.payment_proof_url || null);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);

  useEffect(() => {
    const expiredAt = new Date(order.created_at).getTime() + (24 * 60 * 60 * 1000);
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiredAt - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ h: 0, m: 0, s: 0 });
      } else {
        setTimeLeft({
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [order.created_at]);

  // Fix image URL from R2
  const fixUrl = (url: string | null) => {
    if (!url) return '';
    return url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com');
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(order.invoice_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.print();
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
       const uploadFormData = new FormData();
       uploadFormData.append("file", file);
       const res = await uploadFile(uploadFormData);
       
       if (res.error) {
          showNotification("error", "Gagal Upload", res.error);
       } else if (res.url) {
          const updateRes = await updatePaymentProof(order.invoice_id, res.url);
          if (updateRes.success) {
             setPaymentProofUrl(res.url);
             setPaymentStatus('PAID');
             showNotification("success", "Berhasil", "Bukti transfer berhasil diunggah!");
          } else {
             showNotification("error", "Gagal Disimpan", updateRes.message || "Gagal menyimpan URL bukti transfer.");
          }
       }
    } catch (err) {
       showNotification("error", "Kesalahan Sistem", "Terjadi kesalahan sistem saat upload.");
    } finally {
       setUploading(false);
    }
  };

  const handleWAConfirm = () => {
     if (!paymentProofUrl) {
        showNotification("warning", "Perhatian", "Harap unggah Bukti Transfer terlebih dahulu sebelum konfirmasi ke WA!");
        return;
     }

     const waNumber = tenantConfig?.whatsapp?.replace(/[^0-9]/g, "") || "6281234567890"; // fallback
     
     const message = `Halo Admin, saya ingin konfirmasi pembayaran:
- No. Invoice: *${order.invoice_id}*
- Pesanan: *${order.products?.name}*
- Total: *Rp ${Number(order.total_price).toLocaleString('id-ID')}*
- Bukti Transfer: ${fixUrl(paymentProofUrl)}

Mohon segera diproses ya, terima kasih!`;

     const encoded = encodeURIComponent(message);
     window.open(`https://wa.me/${waNumber}?text=${encoded}`, '_blank');
  };

  // Status mappings
  const stepperStates = [
    { title: "Transaksi Dibuat", desc: "Transaksi telah berhasil dibuat", icon: ShoppingBag, active: true },
    { title: "Pembayaran", desc: "Silakan melakukan pembayaran", icon: CreditCard, active: order.payment_status === 'UNPAID' },
    { title: "Sedang Di Proses", desc: "Pembelian sedang dalam proses.", icon: Cpu, active: order.payment_status === 'PAID' && order.status === 'Processed' },
    { title: "Transaksi Selesai", desc: "Transaksi telah berhasil dilakukan.", icon: CheckCircle2, active: order.status === 'Success' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 print:bg-white print:text-black">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Progress Stepper */}
        <div className="mb-12 print:hidden">
          <h2 className="text-lg font-bold mb-6">Progress Transaksi</h2>
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-800 -z-10 transform -translate-y-1/2"></div>
            {/* Active progress line (dummy calc based on step) */}
            <div className={`absolute left-0 top-1/2 h-0.5 bg-blue-600 -z-10 transform -translate-y-1/2 transition-all duration-500`} style={{ width: order.status === 'Success' ? '100%' : '33%' }}></div>
            
            {stepperStates.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center w-1/4 text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-[#0a0a0a] ${step.active ? 'border-green-500 text-green-500' : 'border-gray-600 text-gray-500'}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="mt-3">
                  <h3 className={`text-sm font-bold ${step.active ? 'text-green-500' : 'text-gray-400'}`}>{step.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Game Info & Pricing */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between print:hidden">
              <h2 className="text-xl font-bold tracking-wide">
                {timeLeft ? `${timeLeft.h} Jam ${timeLeft.m} Menit ${timeLeft.s} Detik` : 'Loading...'}
              </h2>
            </div>

            {/* Account Info Card */}
            <div className="bg-[#151515] rounded-2xl border border-gray-800 p-6 flex gap-6 print:border-gray-300 print:text-black">
              {order.games?.image_url && (
                 <div className="w-32 shrink-0">
                    <img src={order.games.image_url} alt={order.games.name} className="w-full rounded-xl shadow-lg" />
                 </div>
              )}
              <div className="flex-1 space-y-3">
                <h3 className="font-bold text-lg mb-2">Informasi Akun</h3>
                {order.account_data && Object.entries(order.account_data).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-3 text-sm">
                    <div className="col-span-1 text-gray-400 font-medium">{key}</div>
                    <div className="col-span-2 text-white font-semibold print:text-black">: {String(val)}</div>
                  </div>
                ))}
                <div className="grid grid-cols-3 text-sm">
                  <div className="col-span-1 text-gray-400 font-medium">Layanan</div>
                  <div className="col-span-2 text-white font-semibold print:text-black">: {order.products?.name}</div>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-[#151515] rounded-2xl border border-gray-800 overflow-hidden print:border-gray-300">
              <div 
                className="bg-[#1c1c1c] p-4 flex justify-between items-center cursor-pointer hover:bg-[#222]"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              >
                <h3 className="font-bold text-sm text-gray-300">Rincian Pembayaran</h3>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
              </div>
              <div className={`grid transition-all duration-300 ease-in-out ${isDetailsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="p-6 space-y-4 text-sm font-medium">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Harga</span>
                      <span>Rp {Number(order.original_price).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Jumlah</span>
                      <span>1x</span>
                    </div>
                    <div className="border-b border-gray-800/50 pt-2 print:border-gray-300"></div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Potongan Point</span>
                      <span>Rp 0</span>
                    </div>
                    <div className="flex justify-between text-green-500">
                      <span>Potongan Voucher</span>
                      <span>- Rp {Number(order.discount_amount).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="border-b border-gray-800/50 pt-2 print:border-gray-300"></div>
                    <div className="flex justify-between text-base font-bold text-white print:text-black">
                      <span>Subtotal</span>
                      <span className="text-blue-500">Rp {Number(order.total_price).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Payment & QR */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex justify-end print:hidden">
              <Button variant="ghost" className="text-sm font-medium hover:text-white" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" /> Unduh Invoice
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Metode Pembayaran</p>
                <h3 className="text-lg font-bold">{order.payment_channels?.name || "Lainnya"}</h3>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-800 print:border-gray-300">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Nomor Invoice</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{order.invoice_id}</span>
                    <button onClick={handleCopy} className="text-gray-500 hover:text-white transition-colors print:hidden">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Status Pembayaran</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${paymentStatus === 'UNPAID' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                    {paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Status Transaksi</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Kode Voucher / Catatan</span>
                  <span className="font-medium">{order.discount_amount > 0 ? "Promo Digunakan" : "Menunggu pembayaran"}</span>
                </div>
              </div>

              {/* Dynamic Payment Instructions */}
              <div className="pt-6">
                {order.payment_channels?.category === "QRIS" ? (
                   <div className="bg-[#1c1c1c] p-6 rounded-xl border border-blue-500/30 text-center shadow-[0_0_20px_rgba(37,99,235,0.15)] print:shadow-none print:border print:border-gray-300">
                     <p className="text-sm font-bold text-blue-400 mb-2">SCAN UNTUK MEMBAYAR</p>
                     
                     <div className="bg-white p-3 rounded-xl w-64 mx-auto mb-4 relative shadow-lg">
                       {order.payment_channels.qr_image_url ? (
                         <img src={fixUrl(order.payment_channels.qr_image_url)} alt="QRIS" className="w-full h-auto object-contain rounded" />
                       ) : (
                         <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400">
                           <span className="text-xs font-medium">QRIS Belum Diatur</span>
                         </div>
                       )}
                     </div>

                     <div className="bg-blue-500/10 text-blue-400 text-xs p-3 rounded-lg mb-4 text-left border border-blue-500/20">
                       <span className="font-bold flex items-center gap-1 mb-1">⚠️ Perhatian Khusus QRIS Static:</span>
                       Saat memindai QRIS ini di aplikasi M-Banking/E-Wallet Anda, Anda <b>WAJIB MENGETIK NOMINAL TAGIHAN SECARA MANUAL</b>. <br/>
                       Pastikan nominal transfer TEPAT: <b className="text-white text-sm">Rp {Number(order.total_price).toLocaleString("id-ID")}</b>
                     </div>

                     {order.payment_channels.qr_image_url && (
                       <a 
                         href={fixUrl(order.payment_channels.qr_image_url)} 
                         download="QRIS_Payment.png"
                         target="_blank"
                         rel="noreferrer"
                         className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all w-full sm:w-auto justify-center"
                       >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                         Simpan QRIS ke Galeri
                       </a>
                     )}
                   </div>
                ) : order.payment_channels?.account_number === 'WALLET' ? (
                   <div className="bg-[#1c1c1c] p-6 rounded-xl border border-blue-500/30 text-center">
                     <p className="text-sm font-bold text-blue-400 mb-2">PEMBAYARAN SALDO AKUN</p>
                     <p className="text-sm text-gray-400 mb-2">Tagihan akan dipotong dari Saldo Akun secara otomatis.</p>
                     <p className="text-xs text-yellow-500">Mohon tunggu sistem memproses transaksi Anda.</p>
                   </div>
                ) : order.payment_channels?.account_number ? (
                   <div className="bg-[#1c1c1c] p-6 rounded-xl border border-gray-800 text-center print:border-gray-300 print:bg-gray-50">
                     <p className="text-sm text-gray-400 mb-2 print:text-gray-600">Silakan transfer pembayaran ke rekening berikut:</p>
                     <div className="flex items-center justify-center gap-3 mb-2">
                       <h4 className="text-2xl font-black text-blue-500 tracking-wider">{order.payment_channels.account_number}</h4>
                       <button onClick={() => {
                          navigator.clipboard.writeText(order.payment_channels.account_number);
                          showNotification("success", "Tersalin", "Nomor rekening berhasil disalin!");
                       }} className="text-gray-500 hover:text-white transition-colors print:hidden">
                         <Copy className="w-5 h-5" />
                       </button>
                     </div>
                     <p className="font-bold text-white text-lg print:text-black">a.n. {order.payment_channels.account_name || tenantConfig.siteName}</p>
                   </div>
                ) : (
                   <div className="bg-white p-4 rounded-xl w-64 h-64 mx-auto flex items-center justify-center relative shadow-lg print:shadow-none print:border print:border-gray-300">
                     <div className="text-center">
                       <p className="text-black font-bold mb-2">SCAN UNTUK BAYAR</p>
                       <div className="w-48 h-48 border-4 border-dashed border-gray-300 rounded flex items-center justify-center">
                         <span className="text-gray-400 text-sm font-medium">QRIS IMAGE HERE</span>
                       </div>
                     </div>
                   </div>
                )}
              </div>

              {/* Konfirmasi Manual Section */}
              {order.payment_channels?.account_number !== 'WALLET' && (
                <div className="pt-6 pb-2 print:hidden">
                  <div className="bg-[#151515] p-5 rounded-2xl border border-gray-800 space-y-4">
                    <h3 className="font-bold text-white mb-2">Konfirmasi Pembayaran</h3>
                    <p className="text-sm text-gray-400">
                      Silakan unggah bukti transfer Anda agar pesanan dapat segera kami proses.
                    </p>
                    
                    {/* Upload Button */}
                    <label className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${paymentProofUrl ? 'border-green-500/50' : 'border-gray-700 hover:bg-gray-800/50 bg-[#1c1c1c]'}`}>
                      {paymentProofUrl ? (
                        <div className="relative w-full h-full group">
                          <img src={paymentProofUrl} alt="Bukti Transfer" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
                            <span className="text-sm font-bold text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Ganti Gambar</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploading ? (
                            <Loader2 className="w-8 h-8 mb-3 text-blue-500 animate-spin" />
                          ) : (
                            <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                          )}
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold text-white">
                              {uploading ? 'Mengunggah...' : 'Klik untuk upload bukti'}
                            </span>
                          </p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleUploadProof} disabled={uploading} />
                    </label>

                    {/* WA Button */}
                    <Button 
                      onClick={handleWAConfirm}
                      disabled={!paymentProofUrl}
                      className={`w-full h-14 rounded-xl font-bold text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${paymentProofUrl ? 'bg-[#25D366] hover:bg-[#128C7E] text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    >
                      <MessageCircle className="w-5 h-5" /> Konfirmasi via WhatsApp
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-2 pb-4 print:hidden">
                <Button className="w-full bg-[#111111] hover:bg-[#1a1a1a] text-white border border-gray-800 h-14 rounded-xl font-bold text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-500" /> Tracking Order
                </Button>
              </div>

            </div>
          </div>

        </div>
      </div>
      {NotificationComponent}
    </div>
  );
}
