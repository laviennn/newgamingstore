"use client";

import { useState } from "react";
import { Search, Loader2, Navigation, ShoppingCart, RefreshCcw, Ticket, AlertCircle, ExternalLink } from "lucide-react";
import { useNotification } from "@/components/ui/notification";
import { checkOrderStatus } from "@/components/storefront/checkoutActions";
import Link from "next/link";
import Image from "next/image";
import { getDictionary, Language } from "@/lib/dictionary";
import { Currency, formatCurrency } from "@/lib/currencyUtils";

export function TrackClient({ language = 'id', currency = 'IDR' }: { language?: Language, currency?: Currency }) {
  const dict = getDictionary(language);
  const { showNotification, NotificationComponent } = useNotification();
  const [invoiceId, setInvoiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId.trim()) {
      showNotification("warning", "Input Kosong", dict.track_not_found_desc); // using generic desc
      return;
    }

    setLoading(true);
    setSearched(true);
    setOrder(null);

    const res = await checkOrderStatus(invoiceId.trim());
    if (res.success && res.order) {
       setOrder(res.order);
       showNotification("success", "Ditemukan", "Data pesanan berhasil dimuat.");
    } else {
       showNotification("error", dict.track_not_found_title, res.message || dict.track_not_found_desc);
    }
    setLoading(false);
  };

  const isExpired = order ? (new Date().getTime() - new Date(order.created_at).getTime() > 24 * 60 * 60 * 1000) && order.payment_status === 'UNPAID' : false;
  const displayPaymentStatus = isExpired ? 'EXPIRED' : (order?.payment_status || '-');

  return (
    <div className="min-h-[80vh] flex flex-col items-center pt-20 px-4 relative z-10">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-theme-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="text-center mb-10 space-y-4 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          {dict.track_title}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {dict.track_desc}
        </p>
      </div>

      <div className="w-full max-w-xl">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative flex items-center bg-theme-card border border-gray-800 rounded-2xl overflow-hidden focus-within:border-theme-primary/50 focus-within:ring-1 focus-within:ring-blue-500/50 shadow-2xl transition-all">
            <div className="pl-6 text-gray-500">
              <Search className="w-6 h-6" />
            </div>
            <input 
              type="text" 
              placeholder={dict.track_placeholder}
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 py-6 text-white placeholder-gray-600 outline-none w-full"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-theme-primary hover:bg-theme-primary brightness-90 text-white px-8 py-6 font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : dict.track_btn}
            </button>
          </div>
        </form>
      </div>

      {searched && !loading && !order && (
        <div className="mt-16 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto border border-gray-800 shadow-xl">
             <AlertCircle className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-300">{dict.track_not_found_title}</h3>
          <p className="text-gray-500 max-w-sm mx-auto text-sm">{dict.track_not_found_desc}</p>
        </div>
      )}

      {order && (
        <div className="w-full max-w-2xl mt-16 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-gray-800 flex justify-between items-center relative overflow-hidden">
               <div className="absolute -right-10 -top-10 text-white/5 rotate-12">
                 <Ticket className="w-48 h-48" />
               </div>
               <div className="relative z-10">
                 <h2 className="text-sm font-semibold text-theme-primary opacity-90 uppercase tracking-widest mb-1">Invoice ID</h2>
                 <p className="text-2xl font-mono font-black tracking-tight">{order.invoice_id}</p>
               </div>
               <div className="text-right relative z-10">
                 <p className="text-xs text-gray-400 mb-1">{dict.track_date_label}</p>
                 <p className="text-sm font-medium">{new Date(order.created_at).toLocaleString('id-ID')}</p>
               </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 md:p-8 space-y-8">
              
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold">{order.games?.name}</h3>
                    <p className="text-gray-400">{order.products?.name}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6 p-6 bg-[#151515] rounded-2xl border border-gray-800/50">
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">{dict.track_payment_status}</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                       displayPaymentStatus === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                       displayPaymentStatus === 'EXPIRED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                       'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {displayPaymentStatus}
                    </span>
                 </div>
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">{dict.track_process_status}</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                       order.status === 'Success' ? 'bg-[var(--accent-glow)] text-theme-primary opacity-90 border-theme-primary/20' :
                       order.status === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                       'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                      {order.status}
                    </span>
                 </div>
                 
                 {/* Account Data details */}
                 {order.account_data && (
                   <div className="col-span-2 pt-4 border-t border-gray-800/50">
                     <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">{dict.track_account_detail}</p>
                     <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                       {Object.entries(order.account_data).map(([key, val]) => (
                         <div key={key} className="flex flex-col">
                           <span className="text-gray-500 text-xs">{key}</span>
                           <span className="font-semibold text-white">{String(val)}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Payment Proof Preview */}
                 {order.payment_proof_url && (
                   <div className="col-span-2 pt-4 border-t border-gray-800/50">
                     <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">{dict.track_payment_proof}</p>
                     <a href={order.payment_proof_url} target="_blank" rel="noreferrer" className="block relative h-24 w-32 rounded-lg overflow-hidden border border-gray-700 hover:border-theme-primary transition-colors group">
                       <img src={order.payment_proof_url} alt="Bukti Transfer" className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <ExternalLink className="w-6 h-6 text-white" />
                       </div>
                     </a>
                   </div>
                 )}
                 <div className="col-span-2 pt-4 border-t border-gray-800/50 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">{dict.track_total_price}</p>
                      <p className="text-2xl font-black text-white">{formatCurrency(order.total_price, currency)}</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Actions */}
            {order.payment_status === 'UNPAID' && !isExpired && (
              <div className="p-6 bg-[#1a1a1a] border-t border-gray-800 text-center">
                 <p className="text-sm text-gray-400 mb-4">{dict.track_unpaid_notice}</p>
                 <Link href={`/checkout/${order.invoice_id}`} className="inline-flex w-full md:w-auto items-center justify-center bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                   {dict.track_pay_now_btn}
                 </Link>
              </div>
            )}

            {order.payment_status === 'PAID' && order.status !== 'Success' && (
              <div className="p-6 bg-blue-500/5 border-t border-blue-500/10 text-center">
                 <p className="text-sm text-blue-400 font-medium">{dict.checkout_status_paid_processing || "Pembayaran diterima dan pesanan sedang diproses."}</p>
                 <Link href={`/checkout/${order.invoice_id}`} className="mt-3 inline-flex items-center text-sm text-blue-400 hover:text-blue-300 underline font-semibold">
                   {dict.track_full_invoice_btn}
                 </Link>
              </div>
            )}
            
            {order.status === 'Success' && (
              <div className="p-6 bg-green-500/5 border-t border-green-500/10 text-center">
                 <p className="text-sm text-green-400 font-medium">{dict.track_success_notice}</p>
                 <Link href={`/checkout/${order.invoice_id}`} className="mt-4 inline-flex items-center text-sm text-green-400 hover:text-green-300 underline">
                   {dict.track_full_invoice_btn}
                 </Link>
              </div>
            )}

          </div>
        </div>
      )}
      
      {NotificationComponent}
    </div>
  );
}
