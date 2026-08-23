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
import { uploadFile, logUploadError } from "@/app/actions/upload";
import { updatePaymentProof } from "@/components/storefront/checkoutActions";
import { useNotification } from "@/components/ui/notification";
import { getDictionary } from "@/lib/dictionary";
import { formatCurrency, Currency, getProductName } from "@/lib/currencyUtils";
import { buildOrderWAMessage } from "@/lib/whatsappUtils";

import Link from "next/link";
import { normalizeAssetUrl } from "@/lib/storageUtils";

export function CheckoutClient({ order, tenantConfig }: { order: any, tenantConfig: any }) {
  const dict = getDictionary(tenantConfig?.language || 'id');
  const currency: Currency = (order.currency as Currency) || tenantConfig?.currency || (tenantConfig?.language === 'ms' ? 'MYR' : 'IDR');
  const { showNotification, NotificationComponent } = useNotification();
  const [timeLeft, setTimeLeft] = useState<{ h: number, m: number, s: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState(order.payment_proof_url || null);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status || 'UNPAID');

  useEffect(() => {
    // 2 Hour Countdown based on created_at
    const createdAt = new Date(order.created_at).getTime();
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
  }, [order.created_at]);

  const fixUrl = (url: string | null) => {
    if (!url) return '';
    return normalizeAssetUrl(url, tenantConfig?.domain);
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(order.invoice_id);
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

    // Check size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const errorMsg = "Ukuran file terlalu besar. Maksimal 5MB.";
      showNotification("error", "Ukuran File Melebihi Batas", "Ukuran foto bukti transfer maksimal 5MB. Silakan pilih foto lain.");
      await logUploadError({
        context: "Checkout Payment Proof Upload (Size Limit Exceeded)",
        invoiceId: order.invoice_id,
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
          context: "Checkout Payment Proof Upload (R2)",
          invoiceId: order.invoice_id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          errorMessage: res.error,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        });
      } else if (res.url) {
        const updateRes = await updatePaymentProof(order.invoice_id, res.url);
        if (updateRes.success) {
          setPaymentProofUrl(res.url);
          setPaymentStatus('PAID');
          showNotification("success", "Berhasil", "Bukti transfer berhasil diunggah!");
        } else {
          const errorMsg = updateRes.message || "Gagal menyimpan URL bukti transfer.";
          showNotification("error", "Gagal Disimpan", errorMsg);
          await logUploadError({
            context: "Checkout Payment Proof DB Update",
            invoiceId: order.invoice_id,
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
      let rawMsg = err?.message || String(err);
      let userFriendlyMsg = "Terjadi kesalahan saat mengunggah foto bukti pembayaran. Silakan coba lagi.";
      showNotification("error", "Gagal Unggah Gambar", userFriendlyMsg);
      await logUploadError({
        context: "Checkout Payment Proof Exception",
        invoiceId: order.invoice_id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        errorMessage: rawMsg,
        errorStack: err?.stack || String(err),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleWAConfirm = () => {
    if (!paymentProofUrl) {
      showNotification("warning", "Perhatian", "Harap unggah Bukti Transfer terlebih dahulu sebelum konfirmasi ke WA!");
      return;
    }

    const rawWaNumber = tenantConfig?.whatsapp_contacts?.[currency] || tenantConfig?.whatsapp || "6281234567890";
    const waNumber = rawWaNumber.replace(/[^0-9]/g, "");
    const lang = tenantConfig?.language || "id";

    const message = buildOrderWAMessage({
      template: tenantConfig?.waOrderConfirmTemplate,
      language: lang,
      invoiceId: order.invoice_id,
      productName: getProductName(order.products, currency) || order.products?.name || "Game Item",
      totalPriceFormatted: formatCurrency(order.total_price, currency),
      paymentProofUrl: fixUrl(paymentProofUrl),
      storeName: tenantConfig?.siteName || "Store",
      paymentMethodName: order.payment_channels?.name || "",
    });

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${waNumber}?text=${encoded}`, '_blank');
  };

  // Status flags
  const isPaid = paymentStatus === 'PAID';
  const isSuccess = order.status === 'Success';
  const isFailed = order.status === 'Failed';
  const isExpired = !isPaid && !isSuccess && timeLeft?.h === 0 && timeLeft?.m === 0 && timeLeft?.s === 0;

  // Stepper calculations
  const steps = [
    {
      title: dict.checkout_step1_title,
      desc: dict.checkout_step1_desc,
      icon: ShoppingBag,
      state: 'completed', // Step 1 is always completed once checkout is open
    },
    {
      title: dict.checkout_step2_title,
      desc: dict.checkout_step2_desc,
      icon: CreditCard,
      state: isPaid || isSuccess ? 'completed' : isExpired ? 'failed' : 'active',
    },
    {
      title: dict.checkout_step3_title,
      desc: dict.checkout_step3_desc,
      icon: Cpu,
      state: isSuccess ? 'completed' : isPaid && !isFailed ? 'active' : 'inactive',
    },
    {
      title: dict.checkout_step4_title,
      desc: dict.checkout_step4_desc,
      icon: CheckCircle2,
      state: isSuccess ? 'completed' : isFailed ? 'failed' : 'inactive',
    },
  ];

  const progressPercent = isSuccess ? 100 : isPaid ? 66 : 33;

  return (
    <div className="min-h-screen bg-theme-background text-white pt-24 pb-20 print:bg-white print:text-black">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Progress Stepper */}
        <div className="mb-12 print:hidden">
          <h2 className="text-lg font-bold mb-6">{dict.checkout_progress_title}</h2>
          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-800 -z-0 transform -translate-y-1/2"></div>
            {/* Active Progress Line */}
            <div 
              className={`absolute left-0 top-5 h-0.5 ${isFailed ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-theme-primary'} -z-0 transform -translate-y-1/2 transition-all duration-700`} 
              style={{ width: `${progressPercent}%` }}
            ></div>

            {steps.map((step, idx) => {
              const isCompleted = step.state === 'completed';
              const isActive = step.state === 'active';
              const isFail = step.state === 'failed';

              let circleClass = 'border-gray-700 text-gray-500 bg-[#151515]';
              let titleClass = 'text-gray-400';
              let IconComp = step.icon;

              if (isCompleted) {
                circleClass = 'border-green-500 text-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.25)]';
                titleClass = 'text-green-400 font-bold';
                IconComp = CheckCircle2;
              } else if (isActive) {
                circleClass = 'border-theme-primary text-theme-primary bg-theme-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.35)] animate-pulse';
                titleClass = 'text-theme-primary font-bold';
              } else if (isFail) {
                circleClass = 'border-red-500 text-red-400 bg-red-500/10';
                titleClass = 'text-red-400 font-bold';
              }

              return (
                <div key={idx} className="flex flex-col items-center w-1/4 text-center z-10">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${circleClass}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="mt-3">
                    <h3 className={`text-xs md:text-sm transition-colors ${titleClass}`}>{step.title}</h3>
                    <p className="text-[11px] text-gray-500 mt-1 hidden md:block">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Game Info & Pricing */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between print:hidden">
              {isSuccess ? (
                <div className="flex items-center gap-2 text-green-400 font-bold text-lg md:text-xl">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <span>{dict.checkout_status_success || "Transaksi Berhasil Selesai"}</span>
                </div>
              ) : isFailed ? (
                <div className="flex items-center gap-2 text-red-400 font-bold text-lg md:text-xl">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span>{dict.checkout_status_failed || "Transaksi Gagal / Dibatalkan"}</span>
                </div>
              ) : isPaid ? (
                <div className="flex items-center gap-2 text-theme-primary font-bold text-lg md:text-xl">
                  <Cpu className="w-5 h-5 animate-pulse text-theme-primary" />
                  <span>{dict.checkout_status_paid_processing || "Pembayaran Diterima — Sedang Diproses"}</span>
                </div>
              ) : isExpired ? (
                <div className="flex items-center gap-2 text-red-400 font-bold text-lg md:text-xl">
                  <span>⚠️ {dict.checkout_status_expired || "Waktu Pembayaran Habis"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm font-medium">{dict.checkout_time_left_label || "Sisa Waktu"}:</span>
                  <h2 className="text-lg md:text-xl font-bold tracking-wide text-white">
                    {timeLeft ? `${timeLeft.h} Jam ${timeLeft.m} Menit ${timeLeft.s} Detik` : 'Memuat waktu...'}
                  </h2>
                </div>
              )}
            </div>

            {/* Account Info Card */}
            <div className="bg-[#151515] rounded-2xl border border-gray-800 p-4 sm:p-6 flex flex-row items-start gap-4 sm:gap-6 print:border-gray-300 print:text-black">
              {order.games?.image_url && (
                <div className="w-20 sm:w-28 md:w-32 shrink-0">
                  <img src={order.games.image_url} alt={order.games.name} className="w-full rounded-xl shadow-lg aspect-square object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-2.5">
                <h3 className="font-bold text-base sm:text-lg border-b border-gray-800/80 pb-2 mb-3">{dict.checkout_acc_info}</h3>
                {order.account_data && Object.entries(order.account_data).map(([key, val]) => (
                  <div key={key} className="flex items-start text-xs sm:text-sm gap-2">
                    <span className="text-gray-400 font-medium w-20 sm:w-28 shrink-0">{key} :</span>
                    <span className="text-white font-semibold print:text-black break-all min-w-0 flex-1">{String(val)}</span>
                  </div>
                ))}
                <div className="flex items-start text-xs sm:text-sm gap-2">
                  <span className="text-gray-400 font-medium w-20 sm:w-28 shrink-0">{dict.checkout_service_label}</span>
                  <span className="text-white font-semibold print:text-black break-words min-w-0 flex-1">{getProductName(order.products, currency)}</span>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-[#151515] rounded-2xl border border-gray-800 overflow-hidden print:border-gray-300">
              <div
                className="bg-theme-card p-4 flex justify-between items-center cursor-pointer hover:bg-[#222]"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              >
                <h3 className="font-bold text-sm text-gray-300">{dict.checkout_details_title}</h3>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
              </div>
              <div className={`grid transition-all duration-300 ease-in-out ${isDetailsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="p-6 space-y-4 text-sm font-medium">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{dict.checkout_price_item}</span>
                      <span>{formatCurrency(order.original_price, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{dict.checkout_qty_item}</span>
                      <span>1x</span>
                    </div>
                    <div className="border-b border-gray-800/50 pt-2 print:border-gray-300"></div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{dict.checkout_point_discount}</span>
                      <span>{formatCurrency(0, currency)}</span>
                    </div>
                    <div className="flex justify-between text-green-500">
                      <span>{dict.checkout_voucher_discount}</span>
                      <span>- {formatCurrency(order.discount_amount, currency)}</span>
                    </div>
                    <div className="border-b border-gray-800/50 pt-2 print:border-gray-300"></div>
                    <div className="flex justify-between text-base font-bold text-white print:text-black">
                      <span>{dict.checkout_subtotal}</span>
                      <span className="text-theme-primary">{formatCurrency(order.total_price, currency)}</span>
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
                <Download className="w-4 h-4 mr-2" /> {dict.checkout_download_btn}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">{dict.checkout_method_title}</p>
                <h3 className="text-lg font-bold">{order.payment_channels?.name || "Lainnya"}</h3>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-800 print:border-gray-300">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{dict.checkout_invoice_no}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{order.invoice_id}</span>
                    <button onClick={handleCopy} className="text-gray-500 hover:text-white transition-colors print:hidden">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{dict.checkout_payment_status}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${paymentStatus === 'UNPAID' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                    {paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{dict.checkout_trx_status}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    isSuccess ? 'bg-green-500/20 text-green-400' :
                    isFailed ? 'bg-red-500/20 text-red-400' :
                    order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                    'bg-[var(--accent-glow)] text-theme-primary'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{dict.checkout_voucher_note}</span>
                  <span className={`font-medium ${isSuccess ? 'text-green-400' : isPaid ? 'text-theme-primary' : 'text-gray-300'}`}>
                    {order.discount_amount > 0
                      ? dict.checkout_promo_used
                      : isSuccess
                      ? (dict.checkout_order_completed_note || "Pesanan Berhasil Dikirim")
                      : isPaid
                      ? (dict.checkout_payment_verified_note || "Pembayaran Berhasil Diverifikasi")
                      : isExpired
                      ? (dict.checkout_status_expired || "Waktu Pembayaran Habis")
                      : dict.checkout_wait_payment}
                  </span>
                </div>
              </div>

              {/* Dynamic Payment Instructions */}
              <div className="pt-6">
                {order.payment_channels?.category === "QRIS" ? (
                  <div className="bg-theme-card p-6 rounded-xl border border-theme-primary/30 text-center shadow-[0_0_20px_rgba(37,99,235,0.15)] print:shadow-none print:border print:border-gray-300">
                    <p className="text-sm font-bold text-theme-primary opacity-90 mb-2">{dict.checkout_qris_scan}</p>

                    <div className="bg-white p-3 rounded-xl w-64 mx-auto mb-4 relative shadow-lg">
                      {order.payment_channels.qr_image_url ? (
                        <img src={fixUrl(order.payment_channels.qr_image_url)} alt="QRIS" className="w-full h-auto object-contain rounded" />
                      ) : (
                        <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400">
                          <span className="text-xs font-medium">{dict.checkout_qris_not_set}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-[var(--accent-glow)] text-theme-primary opacity-90 text-xs p-3 rounded-lg mb-4 text-left border border-theme-primary/20">
                      <span className="font-bold flex items-center gap-1 mb-1">{dict.checkout_qris_warn_title}</span>
                      {dict.checkout_qris_warn_desc} <br />
                      <b className="text-white text-sm">{formatCurrency(order.total_price, currency)}</b>
                    </div>

                    {order.payment_channels.qr_image_url && (
                      <a
                        href={fixUrl(order.payment_channels.qr_image_url)}
                        download="QRIS_Payment.png"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-theme-primary hover:bg-theme-primary brightness-90 text-white font-bold py-2.5 px-6 rounded-xl transition-all w-full sm:w-auto justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {dict.checkout_qris_save_btn}
                      </a>
                    )}
                  </div>
                ) : order.payment_channels?.account_number === 'WALLET' ? (
                  <div className="bg-theme-card p-6 rounded-xl border border-theme-primary/30 text-center">
                    <p className="text-sm font-bold text-theme-primary opacity-90 mb-2">{dict.checkout_wallet_title}</p>
                    <p className="text-sm text-gray-400 mb-2">{dict.checkout_wallet_desc}</p>
                    <p className="text-xs text-yellow-500">{dict.checkout_wallet_wait}</p>
                  </div>
                ) : order.payment_channels?.account_number ? (
                  <div className="bg-theme-card p-6 rounded-xl border border-gray-800 text-center print:border-gray-300 print:bg-gray-50">
                    <p className="text-sm text-gray-400 mb-2 print:text-gray-600">{dict.checkout_bank_transfer}</p>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <h4 className="text-2xl font-black text-theme-primary tracking-wider">{order.payment_channels.account_number}</h4>
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
                    <h3 className="font-bold text-white mb-2">{dict.checkout_confirm_title}</h3>
                    <p className="text-sm text-gray-400">
                      {dict.checkout_confirm_desc}
                    </p>

                    {/* Upload Button */}
                    <div className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all overflow-hidden ${paymentProofUrl ? 'border-green-500/50' : 'border-gray-700 hover:bg-gray-800/50 bg-theme-card'}`}>
                      {paymentProofUrl ? (
                        <div className="relative w-full h-full group">
                          <img src={fixUrl(paymentProofUrl)} alt="Bukti Transfer" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
                            <span className="text-sm font-bold text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">{dict.checkout_change_img}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                          {uploading ? (
                            <Loader2 className="w-8 h-8 mb-3 text-theme-primary animate-spin" />
                          ) : (
                            <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                          )}
                          <p className="mb-1 text-sm text-gray-400">
                            <span className="font-semibold text-white">
                              {uploading ? dict.checkout_uploading : dict.checkout_click_upload}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {dict.checkout_size_limit}
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
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                      </svg>{dict.checkout_confirm_wa}
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-2 pb-4 print:hidden">
                <Link href={`/track?invoice=${order.invoice_id}`}>
                  <Button className="w-full bg-theme-card hover:bg-[#1a1a1a] text-white border border-gray-800 h-14 rounded-xl font-bold text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <Navigation className="w-5 h-5 text-theme-primary" /> {dict.checkout_tracking_btn}
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
