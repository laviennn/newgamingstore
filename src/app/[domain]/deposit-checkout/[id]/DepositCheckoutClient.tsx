"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
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
  Loader2,
  Wallet
} from "lucide-react";
import { uploadFile, logUploadError } from "@/app/actions/upload";
import { updateDepositProof } from "@/components/storefront/depositActions";
import { useNotification } from "@/components/ui/notification";
import Link from "next/link";

export function DepositCheckoutClient({ deposit, tenantConfig }: { deposit: any, tenantConfig: any }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number} | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState(deposit.payment_proof_url || null);
  const [paymentStatus, setPaymentStatus] = useState(deposit.payment_status || 'UNPAID');
  const [status, setStatus] = useState(deposit.status || 'Pending');

  useEffect(() => {
    // 2 Hour Countdown based on created_at
    const createdAt = new Date(deposit.created_at).getTime();
    const expiryTime = createdAt + 2 * 60 * 60 * 1000; // + 2 hours

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = expiryTime - now;

      if (distance < 0) {
        setTimeLeft({ h: 0, m: 0, s: 0 });
        return;
      }

      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ h, m, s });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deposit.created_at]);

  const fixUrl = (url: string | null) => {
    if (!url) return '';
    return url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com');
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(deposit.invoice_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.print();
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const errorMsg = "Ukuran file terlalu besar. Maksimal 10MB.";
      showNotification("error", "Gagal Upload", errorMsg);
      await logUploadError({
        context: "Deposit Payment Proof Upload",
        invoiceId: deposit.invoice_id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        errorMessage: errorMsg,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      });
      return;
    }

    setUploading(true);
    try {
       const uploadFormData = new FormData();
       uploadFormData.append("file", file);
       const res = await uploadFile(uploadFormData);
       
       if (res.error) {
          showNotification("error", "Gagal Upload", res.error);
          await logUploadError({
             context: "Deposit Payment Proof Upload (R2)",
             invoiceId: deposit.invoice_id,
             fileName: file.name,
             fileSize: file.size,
             fileType: file.type,
             errorMessage: res.error,
             userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
             url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
          });
       } else if (res.url) {
          const updateRes = await updateDepositProof(deposit.invoice_id, res.url);
          if (updateRes.success) {
             setPaymentProofUrl(res.url);
             setPaymentStatus('PAID');
             setStatus('Processed');
             showNotification("success", "Berhasil", "Bukti transfer berhasil diunggah!");
          } else {
             const errorMsg = updateRes.message || "Gagal menyimpan URL bukti transfer.";
             showNotification("error", "Gagal Disimpan", errorMsg);
             await logUploadError({
                context: "Deposit Payment Proof DB Update",
                invoiceId: deposit.invoice_id,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                errorMessage: errorMsg,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
                url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
             });
          }
       }
    } catch (err: any) {
       const errorMsg = err?.message || "Terjadi kesalahan sistem saat upload.";
       showNotification("error", "Kesalahan Sistem", errorMsg);
       await logUploadError({
          context: "Deposit Payment Proof Exception",
          invoiceId: deposit.invoice_id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          errorMessage: errorMsg,
          errorStack: err?.stack || String(err),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
       });
    } finally {
       setUploading(false);
    }
  };

  const isUpgrade = deposit.metadata?.type === 'UPGRADE' || deposit.invoice_id?.startsWith('UPG-');
  const packageName = deposit.metadata?.package_name || "Upgrade Membership";

  const handleWAConfirm = () => {
     if (!paymentProofUrl) {
        showNotification("warning", "Perhatian", "Harap unggah Bukti Transfer terlebih dahulu sebelum konfirmasi ke WA!");
        return;
     }

     const waNumber = tenantConfig?.whatsapp?.replace(/[^0-9]/g, "") || "6281234567890"; // fallback
     
     const message = isUpgrade 
       ? `Halo Admin, saya ingin konfirmasi upgrade membership (${packageName}):
- No. Invoice: *${deposit.invoice_id}*
- Total Biaya: *Rp ${Number(deposit.amount).toLocaleString('id-ID')}*
- Bukti Transfer: ${fixUrl(paymentProofUrl)}

Mohon segera diproses ya, terima kasih!`
       : `Halo Admin, saya ingin konfirmasi deposit saldo:
- No. Invoice: *${deposit.invoice_id}*
- Nominal Deposit: *Rp ${Number(deposit.amount).toLocaleString('id-ID')}*
- Bukti Transfer: ${fixUrl(paymentProofUrl)}

Mohon segera diproses ya, terima kasih!`;

     const encoded = encodeURIComponent(message);
     window.open(`https://wa.me/${waNumber}?text=${encoded}`, '_blank');
  };

  // Status mappings
  const stepperStates = [
    { title: "Permohonan Dibuat", desc: isUpgrade ? "Permohonan upgrade dibuat" : "Permohonan deposit dibuat", icon: Wallet, active: true },
    { title: "Pembayaran", desc: "Silakan melakukan pembayaran", icon: CreditCard, active: paymentStatus === 'UNPAID' },
    { title: "Sedang Di Proses", desc: "Verifikasi pembayaran.", icon: Cpu, active: paymentStatus === 'PAID' && status === 'Processed' },
    { title: isUpgrade ? "Upgrade Berhasil" : "Deposit Berhasil", desc: isUpgrade ? `Akun telah diupgrade ke ${packageName}.` : "Saldo telah ditambahkan.", icon: CheckCircle2, active: status === 'Success' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 print:bg-white print:text-black">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Progress Stepper */}
        <div className="mb-12 print:hidden">
          <h2 className="text-lg font-bold mb-6">Progress {isUpgrade ? 'Upgrade' : 'Deposit'}</h2>
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-800 -z-10 transform -translate-y-1/2"></div>
            {/* Active progress line (dummy calc based on step) */}
            <div className={`absolute left-0 top-1/2 h-0.5 bg-blue-600 -z-10 transform -translate-y-1/2 transition-all duration-500`} style={{ width: status === 'Success' ? '100%' : '33%' }}></div>
            
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
          
          {/* Left Column: Info & Pricing */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between print:hidden">
              <h2 className="text-xl font-bold tracking-wide">
                {timeLeft ? `${timeLeft.h} Jam ${timeLeft.m} Menit ${timeLeft.s} Detik` : 'Loading...'}
              </h2>
            </div>

            {/* Account Info Card */}
            <div className="bg-[#151515] rounded-2xl border border-gray-800 p-4 sm:p-6 flex flex-row items-start gap-4 sm:gap-6 print:border-gray-300 print:text-black">
              <div className="flex-1 min-w-0 space-y-2.5">
                <h3 className="font-bold text-base sm:text-lg border-b border-gray-800/80 pb-2 mb-3">Informasi Akun</h3>
                <div className="flex items-start text-xs sm:text-sm gap-2">
                  <span className="text-gray-400 font-medium w-24 sm:w-28 shrink-0">Email :</span>
                  <span className="text-white font-semibold print:text-black break-all min-w-0 flex-1">{deposit.customer_email}</span>
                </div>
                <div className="flex items-start text-xs sm:text-sm gap-2">
                  <span className="text-gray-400 font-medium w-24 sm:w-28 shrink-0">No. WhatsApp :</span>
                  <span className="text-white font-semibold print:text-black break-all min-w-0 flex-1">{deposit.wa_number || "-"}</span>
                </div>
                <div className="flex items-start text-xs sm:text-sm gap-2">
                  <span className="text-gray-400 font-medium w-24 sm:w-28 shrink-0">Layanan :</span>
                  <span className="text-white font-semibold print:text-black break-words min-w-0 flex-1">{isUpgrade ? `Upgrade Membership (${packageName})` : 'Deposit Saldo'}</span>
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
                      <span className="text-gray-400">{isUpgrade ? 'Biaya Upgrade' : 'Nominal Deposit'}</span>
                      <span>Rp {Number(deposit.amount).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="border-b border-gray-800/50 pt-2 print:border-gray-300"></div>
                    <div className="flex justify-between text-base font-bold text-white print:text-black">
                      <span>Total Bayar</span>
                      <span className="text-blue-500">Rp {Number(deposit.amount).toLocaleString('id-ID')}</span>
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
                <h3 className="text-lg font-bold">{deposit.payment_channels?.name || "Lainnya"}</h3>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-800 print:border-gray-300">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Nomor Invoice</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{deposit.invoice_id}</span>
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
                  <span className="text-gray-400">{isUpgrade ? 'Status Upgrade' : 'Status Deposit'}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {status}
                  </span>
                </div>
              </div>

              {/* Dynamic Payment Instructions */}
              <div className="pt-6">
                {deposit.payment_channels?.category === "QRIS" ? (
                   <div className="bg-[#1c1c1c] p-6 rounded-xl border border-blue-500/30 text-center shadow-[0_0_20px_rgba(37,99,235,0.15)] print:shadow-none print:border print:border-gray-300">
                     <p className="text-sm font-bold text-blue-400 mb-2">SCAN UNTUK MEMBAYAR</p>
                     
                     <div className="bg-white p-3 rounded-xl w-64 mx-auto mb-4 relative shadow-lg">
                       {deposit.payment_channels.qr_image_url ? (
                         <img src={fixUrl(deposit.payment_channels.qr_image_url)} alt="QRIS" className="w-full h-auto object-contain rounded" />
                       ) : (
                         <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400">
                           <span className="text-xs font-medium">QRIS Belum Diatur</span>
                         </div>
                       )}
                     </div>

                     <div className="bg-blue-500/10 text-blue-400 text-xs p-3 rounded-lg mb-4 text-left border border-blue-500/20">
                       <span className="font-bold flex items-center gap-1 mb-1">⚠️ Perhatian Khusus QRIS Static:</span>
                       Saat memindai QRIS ini di aplikasi M-Banking/E-Wallet Anda, Anda <b>WAJIB MENGETIK NOMINAL TAGIHAN SECARA MANUAL</b>. <br/>
                       Pastikan nominal transfer TEPAT: <b className="text-white text-sm">Rp {Number(deposit.amount).toLocaleString("id-ID")}</b>
                     </div>

                     {deposit.payment_channels.qr_image_url && (
                       <a 
                         href={fixUrl(deposit.payment_channels.qr_image_url)} 
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
                ) : deposit.payment_channels?.account_number ? (
                   <div className="bg-[#1c1c1c] p-6 rounded-xl border border-gray-800 text-center print:border-gray-300 print:bg-gray-50">
                     <p className="text-sm text-gray-400 mb-2 print:text-gray-600">Silakan transfer pembayaran ke rekening berikut:</p>
                     <div className="flex items-center justify-center gap-3 mb-2">
                       <h4 className="text-2xl font-black text-blue-500 tracking-wider">{deposit.payment_channels.account_number}</h4>
                       <button onClick={() => {
                          navigator.clipboard.writeText(deposit.payment_channels.account_number);
                          showNotification("success", "Tersalin", "Nomor rekening berhasil disalin!");
                       }} className="text-gray-500 hover:text-white transition-colors print:hidden">
                         <Copy className="w-5 h-5" />
                       </button>
                     </div>
                     <p className="font-bold text-white text-lg print:text-black">a.n. {deposit.payment_channels.account_name || tenantConfig.siteName}</p>
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
              {status !== 'Success' && (
                <div className="pt-6 pb-2 print:hidden">
                  <div className="bg-[#151515] p-5 rounded-2xl border border-gray-800 space-y-4">
                    <h3 className="font-bold text-white mb-2">Konfirmasi Pembayaran</h3>
                    <p className="text-sm text-gray-400">
                      Silakan unggah bukti transfer Anda agar {isUpgrade ? 'permohonan upgrade' : 'deposit'} dapat segera diverifikasi.
                    </p>
                    
                    {/* Upload Button */}
                    <div className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all overflow-hidden ${paymentProofUrl ? 'border-green-500/50' : 'border-gray-700 hover:bg-gray-800/50 bg-[#1c1c1c]'}`}>
                      {paymentProofUrl ? (
                        <div className="relative w-full h-full group">
                          <img src={paymentProofUrl} alt="Bukti Transfer" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
                            <span className="text-sm font-bold text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Ganti Gambar</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
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
                      <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 block" 
                        accept="image/*,image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif" 
                        onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                        onChange={handleUploadProof} 
                        disabled={uploading} 
                      />
                    </div>

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
                <Link href="/member/dashboard">
                  <Button className="w-full bg-[#111111] hover:bg-[#1a1a1a] text-white border border-gray-800 h-14 rounded-xl font-bold text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-500" /> Kembali ke Dashboard
                  </Button>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
      {NotificationComponent}
    </div>
  );
}
