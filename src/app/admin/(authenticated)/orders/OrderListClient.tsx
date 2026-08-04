"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { adminUpdateOrderStatus, deleteOrder } from "./actions";
import { Loader2, Eye, ExternalLink, Trash2 } from "lucide-react";
import { useNotification } from "@/components/ui/notification";
import Image from "next/image";

export function OrderListClient({ initialOrders }: { initialOrders: any[] }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDeleteOrder = async (invoiceId: string) => {
     if (!confirm(`Apakah Anda yakin ingin menghapus pesanan dengan Invoice ${invoiceId}?`)) return;
     
     setLoadingId(invoiceId);
     const res = await deleteOrder(invoiceId);
     if (res.success) {
        setOrders(prev => prev.filter(o => (o.invoice_id || o.id) !== invoiceId));
        if (selectedOrder && (selectedOrder.invoice_id || selectedOrder.id) === invoiceId) {
            setIsModalOpen(false);
            setSelectedOrder(null);
        }
        showNotification("success", "Berhasil Dihapus", `Pesanan ${invoiceId} telah berhasil dihapus dari database.`);
     } else {
        showNotification("error", "Gagal Menghapus", res.message);
     }
     setLoadingId(null);
  };

  const openDetails = (order: any) => {
      setSelectedOrder(order);
      setIsModalOpen(true);
  };

  return (
    <>
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm text-left">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 font-medium">Invoice</th>
              <th className="h-12 px-4 font-medium">Item</th>
              <th className="h-12 px-4 font-medium">Total</th>
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

              return (
                <tr key={o.id || o.invoice_id} className={`border-b transition-colors hover:bg-muted/50 ${isExpired ? 'opacity-70' : ''}`}>
                  <td className="p-4 font-mono font-medium text-xs">
                    {o.invoice_id || (o.id && typeof o.id === 'string' ? o.id.substring(0, 13) : 'N/A')}
                  </td>
                  <td className="p-4">
                     <div className="font-semibold">{o.games?.name}</div>
                     <div className="text-muted-foreground text-xs">{o.products?.name}</div>
                  </td>
                  <td className="p-4 font-medium">Rp {Number(o.total_price).toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        displayPaymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                        displayPaymentStatus === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                      {displayPaymentStatus}
                    </span>
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
                  <td className="p-4 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="p-4 text-right space-x-1 flex items-center justify-end">
                    <Button variant="outline" size="sm" onClick={() => openDetails(o)}>
                       <Eye className="w-4 h-4 mr-1" /> Detail
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      disabled={loadingId === (o.invoice_id || o.id)}
                      onClick={() => handleDeleteOrder(o.invoice_id || o.id)}
                      title="Hapus Order"
                    >
                      {loadingId === (o.invoice_id || o.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
            <DialogTitle className="text-2xl font-bold">Detail Pesanan</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Informasi Umum</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Invoice ID</div>
                    <div className="font-mono">{selectedOrder.invoice_id}</div>
                    <div className="font-medium">Tanggal</div>
                    <div>{new Date(selectedOrder.created_at).toLocaleString()}</div>
                    <div className="font-medium">Status Pembayaran</div>
                    <div>
                       <span className={`px-2 py-1 rounded-md text-xs font-bold ${selectedOrder.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                         {selectedOrder.payment_status}
                       </span>
                    </div>
                    <div className="font-medium">Status Transaksi</div>
                    <div>
                       <span className={`px-2 py-1 rounded-md text-xs font-bold ${selectedOrder.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                         {selectedOrder.status}
                       </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Data Akun & Item</h3>
                  <div className="bg-muted/30 p-4 rounded-xl space-y-2 text-sm">
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
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground">Total Harga</span>
                      <span className="font-bold text-lg text-blue-600">Rp {Number(selectedOrder.total_price).toLocaleString('id-ID')}</span>
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
                    onClick={() => handleDeleteOrder(selectedOrder.invoice_id)}
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
      {NotificationComponent}
    </>
  );
}
