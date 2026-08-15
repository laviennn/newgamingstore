"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminUpdateOrderStatus, deleteOrder } from "./actions";
import { Loader2, Eye, ExternalLink, Trash2, CreditCard, Wallet } from "lucide-react";
import { useNotification } from "@/components/ui/notification";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import Image from "next/image";
import { Currency, formatCurrency } from "@/lib/currencyUtils";

export function OrderListClient({ initialOrders, currency = 'IDR' }: { initialOrders: any[], currency?: Currency }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  const handleProcess = async (invoiceId: string) => {
     setLoadingId(invoiceId);
     const res = await adminUpdateOrderStatus(invoiceId, 'Success', 'PAID');
     if (res.success) {
        setOrders(orders.map(o => o.invoice_id === invoiceId ? { ...o, status: 'Success', payment_status: 'PAID' } : o));
        if (selectedOrder && selectedOrder.invoice_id === invoiceId) {
            setSelectedOrder({ ...selectedOrder, status: 'Success', payment_status: 'PAID' });
        }
        showNotification("success", "Berhasil Memproses", "Status order berhasil diubah menjadi Success.");
     } else {
        showNotification("error", "Gagal Memproses", res.message);
     }
     setLoadingId(null);
  };

  const handleDeleteOrder = async () => {
     if (!deleteTarget) return;
     setLoadingId(deleteTarget.id);
     const res = await deleteOrder(deleteTarget.id);
     if (res.success) {
        setOrders(prev => prev.filter(o => (o.invoice_id || o.id) !== deleteTarget.id));
        if (selectedOrder && (selectedOrder.invoice_id || selectedOrder.id) === deleteTarget.id) {
            setIsModalOpen(false);
            setSelectedOrder(null);
        }
        showNotification("success", "Berhasil Dihapus", `Pesanan ${deleteTarget.label} telah berhasil dihapus dari database.`);
     } else {
        showNotification("error", "Gagal Menghapus", res.message);
     }
     setLoadingId(null);
     setDeleteTarget(null);
  };

  const openDetails = (order: any) => {
      setSelectedOrder(order);
      setIsModalOpen(true);
  };

  return (
    <>
      {NotificationComponent}

      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteOrder}
        title="Hapus Pesanan"
        description="Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan."
        itemName={deleteTarget?.label}
        loading={loadingId === deleteTarget?.id}
      />

      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm text-left">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 font-medium">Invoice</th>
              <th className="h-12 px-4 font-medium">Item</th>
              <th className="h-12 px-4 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Total</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                    {currency === 'MYR' ? '🇲🇾 RM' : '🇮🇩 Rp'}
                  </span>
                </div>
              </th>
              <th className="h-12 px-4 font-medium">Payment</th>
              <th className="h-12 px-4 font-medium">Status</th>
              <th className="h-12 px-4 font-medium">Date</th>
              <th className="h-12 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {orders.map((o) => {
              const now = new Date().getTime();
              const created = new Date(o.created_at).getTime();
              const isExpired = (now - created > 24 * 60 * 60 * 1000) && o.payment_status === 'UNPAID';
              const displayPaymentStatus = isExpired ? 'EXPIRED' : o.payment_status;
              const orderId = o.invoice_id || o.id;
              const orderCurr = o.currency || currency;

              return (
                <tr key={o.id || o.invoice_id} className={`border-b transition-colors hover:bg-muted/50 ${isExpired ? 'opacity-70' : ''}`}>
                  <td className="p-4 font-mono font-medium text-xs">
                    {o.invoice_id || (o.id && typeof o.id === 'string' ? o.id.substring(0, 13) : 'N/A')}
                  </td>
                  <td className="p-4">
                     <div className="font-semibold">{o.games?.name}</div>
                     <div className="text-muted-foreground text-xs">{o.products?.name}</div>
                  </td>
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-xs">{orderCurr === 'MYR' ? '🇲🇾' : '🇮🇩'}</span>
                      <span>{formatCurrency(Number(o.total_price), orderCurr)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          displayPaymentStatus === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' :
                          displayPaymentStatus === 'EXPIRED' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400'
                      }`}>
                        {displayPaymentStatus}
                      </span>
                      <div className="text-xs font-medium text-muted-foreground truncate max-w-[130px]" title={o.payment_channels?.name || (o.payment_channel_id === '11111111-1111-1111-1111-111111111111' ? 'Saldo Akun' : '-')}>
                        {o.payment_channel_id === '11111111-1111-1111-1111-111111111111' ? '💳 Saldo Akun' : (o.payment_channels?.name || '-')}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        o.status === 'Success' ? 'bg-green-100 text-green-700' :
                        o.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        o.status === 'Failed' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs" suppressHydrationWarning>{new Date(o.created_at).toLocaleString('id-ID')}</td>
                  <td className="p-4 text-right space-x-1 flex items-center justify-end">
                    <Button variant="outline" size="sm" onClick={() => openDetails(o)}>
                       <Eye className="w-4 h-4 mr-1" /> Detail
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      disabled={loadingId === orderId}
                      onClick={() => setDeleteTarget({ id: orderId, label: o.invoice_id || orderId })}
                      title="Hapus Order"
                    >
                      {loadingId === orderId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between pr-6">
              <span>Detail Pesanan</span>
              {selectedOrder && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs ${
                  (selectedOrder.currency || currency) === 'MYR' 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                }`}>
                  {(selectedOrder.currency || currency) === 'MYR' ? '🇲🇾 MYR (RM)' : '🇮🇩 IDR (Rp)'}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Informasi Umum</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm bg-muted/20 p-3.5 rounded-xl border border-border/30">
                    <div className="font-medium text-muted-foreground">Invoice ID</div>
                    <div className="font-mono font-bold text-foreground">{selectedOrder.invoice_id}</div>
                    <div className="font-medium text-muted-foreground">Tanggal</div>
                    <div suppressHydrationWarning className="text-foreground">{new Date(selectedOrder.created_at).toLocaleString('id-ID')}</div>
                    <div className="font-medium text-muted-foreground">Status Pembayaran</div>
                    <div>
                       <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${selectedOrder.payment_status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400'}`}>
                         {selectedOrder.payment_status}
                       </span>
                    </div>
                    <div className="font-medium text-muted-foreground">Status Transaksi</div>
                    <div>
                       <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${selectedOrder.status === 'Success' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'}`}>
                         {selectedOrder.status}
                       </span>
                    </div>
                    {selectedOrder.customer_email && (
                      <>
                        <div className="font-medium text-muted-foreground">Kontak / Email</div>
                        <div className="font-mono text-xs text-foreground truncate">{selectedOrder.customer_email}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Metode Pembayaran Section */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>Metode Pembayaran</span>
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-xl space-y-2.5 text-sm border border-border/40">
                    {selectedOrder.payment_channel_id === '11111111-1111-1111-1111-111111111111' ? (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Metode</span>
                        <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs">
                          <Wallet className="w-3.5 h-3.5" /> Saldo Akun (Member Balance)
                        </span>
                      </div>
                    ) : selectedOrder.payment_channels ? (
                      <>
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                          <span className="text-muted-foreground">Channel</span>
                          <div className="flex items-center gap-2">
                            {selectedOrder.payment_channels.logo_url && (
                              <div className="relative w-8 h-5 bg-white rounded border overflow-hidden shrink-0">
                                <img 
                                  src={selectedOrder.payment_channels.logo_url} 
                                  alt="Logo" 
                                  className="w-full h-full object-contain p-0.5" 
                                />
                              </div>
                            )}
                            <span className="font-bold text-foreground">{selectedOrder.payment_channels.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-b border-border/30 py-2">
                          <span className="text-muted-foreground">Kategori</span>
                          <span className="font-semibold text-xs px-2 py-0.5 rounded bg-muted text-foreground border border-border/40">
                            {selectedOrder.payment_channels.category || 'Bank Transfer'}
                          </span>
                        </div>

                        {selectedOrder.payment_channels.account_number && (
                          <div className="flex items-center justify-between border-b border-border/30 py-2">
                            <span className="text-muted-foreground">No. Rekening / HP</span>
                            <span className="font-mono font-bold text-foreground select-all">
                              {selectedOrder.payment_channels.account_number}
                            </span>
                          </div>
                        )}

                        {selectedOrder.payment_channels.account_name && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-muted-foreground">Atas Nama</span>
                            <span className="font-semibold text-foreground">
                              {selectedOrder.payment_channels.account_name}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Metode</span>
                        <span className="font-semibold text-muted-foreground">
                          {selectedOrder.payment_channel_id ? `ID: ${selectedOrder.payment_channel_id.substring(0, 8)}...` : 'Transfer Manual'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Data Akun & Item</h3>
                  <div className="bg-muted/30 p-4 rounded-xl space-y-2 text-sm border border-border/40">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Game</span>
                      <span className="font-bold">{selectedOrder.games?.name}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                      <span className="text-muted-foreground">Layanan</span>
                      <span className="font-bold text-right">{selectedOrder.products?.name}</span>
                    </div>
                    {selectedOrder.account_data && Object.entries(selectedOrder.account_data).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b py-2">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-bold">{String(v)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-muted-foreground">Total Harga</span>
                      <div className="flex items-center gap-1.5 font-bold text-lg text-primary">
                        <span className="text-sm">{(selectedOrder.currency || currency) === 'MYR' ? '🇲🇾' : '🇮🇩'}</span>
                        <span>{formatCurrency(Number(selectedOrder.total_price), selectedOrder.currency || currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bukti Pembayaran</h3>
                  {selectedOrder.payment_proof_url ? (
                    <div className="border rounded-xl p-2 bg-muted/20">
                      <a href={selectedOrder.payment_proof_url} target="_blank" rel="noreferrer" className="block relative w-full h-64 hover:opacity-90 transition-opacity">
                         <img src={selectedOrder.payment_proof_url} alt="Bukti Transfer" className="w-full h-full object-contain rounded-lg" />
                         <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                           <ExternalLink className="w-4 h-4" />
                         </div>
                      </a>
                      <p className="text-xs text-center text-muted-foreground mt-2">Klik gambar untuk melihat ukuran penuh</p>
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-xl h-64 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground">
                      <p>Bukti belum diunggah.</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t flex items-center gap-3">
                  <Button 
                    className="flex-1 h-12 text-base font-bold" 
                    onClick={() => handleProcess(selectedOrder.invoice_id)}
                    disabled={loadingId === selectedOrder.invoice_id || selectedOrder.status === 'Success'}
                  >
                    {loadingId === selectedOrder.invoice_id ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                    {selectedOrder.status === 'Success' ? 'Pesanan Selesai' : 'Terima Pembayaran & Proses'}
                  </Button>
                  <Button
                    variant="destructive"
                    className="h-12 px-4 font-bold"
                    disabled={loadingId === selectedOrder.invoice_id}
                    onClick={() => setDeleteTarget({ 
                      id: selectedOrder.invoice_id || selectedOrder.id, 
                      label: selectedOrder.invoice_id 
                    })}
                    title="Hapus Pesanan"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
