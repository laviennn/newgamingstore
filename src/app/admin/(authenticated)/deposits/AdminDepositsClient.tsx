"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useNotification } from "@/components/ui/notification";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Loader2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { Currency, formatCurrency } from "@/lib/currencyUtils";

export function AdminDepositsClient({ initialDeposits, currency = 'IDR' }: { initialDeposits: any[], currency?: Currency }) {
  const { showNotification, NotificationComponent } = useNotification();
  const supabase = createClient();
  const [deposits, setDeposits] = useState(initialDeposits);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; invoice_id: string } | null>(null);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsLoading(id);
    try {
      const { error } = await supabase
        .from('deposits')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
      showNotification("success", "Status Diperbarui", `Deposit berhasil diubah menjadi ${newStatus}`);
    } catch (err) {
      console.error(err);
      showNotification("error", "Gagal", "Terjadi kesalahan saat memperbarui status.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDeleteDeposit = async () => {
    if (!deleteTarget) return;
    setIsLoading(deleteTarget.id);
    try {
      const { error } = await supabase.from('deposits').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      setDeposits(prev => prev.filter(d => d.id !== deleteTarget.id));
      showNotification("success", "Berhasil Dihapus", `Deposit ${deleteTarget.invoice_id} telah dihapus.`);
    } catch (err) {
      console.error(err);
      showNotification("error", "Gagal", "Terjadi kesalahan saat menghapus data.");
    } finally {
      setIsLoading(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-background rounded-lg border shadow-sm">
      {NotificationComponent}

      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteDeposit}
        title="Hapus Data Deposit"
        description="Apakah Anda yakin ingin menghapus data deposit ini? Tindakan ini tidak dapat dibatalkan."
        itemName={deleteTarget?.invoice_id}
        loading={isLoading === deleteTarget?.id}
      />

      <div className="overflow-x-auto rounded-lg border-t border-muted/20">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-muted-foreground uppercase bg-muted/30 tracking-widest">
            <tr>
              <th className="px-4 py-3">Invoice & Waktu</th>
              <th className="px-4 py-3">Kontak Member</th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span>Nominal</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                    {currency === 'MYR' ? '🇲🇾 RM' : '🇮🇩 Rp'}
                  </span>
                  <span>& Metode</span>
                </div>
              </th>
              <th className="px-4 py-3 text-center">Bukti Transfer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {deposits.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada permohonan deposit.
                </td>
              </tr>
            ) : (
              deposits.map((dep) => (
                <tr key={dep.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-4 py-4 border-b border-muted/20">
                    <div className="font-semibold text-primary flex items-center gap-2">
                      {dep.invoice_id}
                      {dep.metadata?.type === 'UPGRADE' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                          UPGRADE {dep.metadata.package_name}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(dep.created_at).toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-muted/20">
                    <div>{dep.customer_email}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{dep.wa_number || "-"}</div>
                  </td>
                  <td className="px-4 py-4 border-b border-muted/20">
                    <div className="font-bold text-green-500 flex items-center gap-1.5">
                      <span className="text-xs">{(dep.currency || currency) === 'MYR' ? '🇲🇾' : '🇮🇩'}</span>
                      <span>{formatCurrency(Number(dep.amount), dep.currency || currency)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {dep.payment_channels?.name || "Manual"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center border-b border-muted/20">
                    {dep.payment_proof_url ? (
                      <Button variant="outline" size="sm" onClick={() => setSelectedProof(dep.payment_proof_url)}>
                        <Eye className="w-4 h-4 mr-1" /> Lihat Bukti
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Belum ada</span>
                    )}
                  </td>
                  <td className="px-4 py-4 border-b border-muted/20">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      dep.status === 'Success' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      dep.status === 'Failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      dep.status === 'Processed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {dep.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right border-b border-muted/20">
                    <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {dep.status !== 'Success' && dep.status !== 'Failed' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                            disabled={isLoading === dep.id}
                            onClick={() => handleUpdateStatus(dep.id, 'Success')}
                            title="Setujui Deposit"
                          >
                            {isLoading === dep.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            disabled={isLoading === dep.id}
                            onClick={() => handleUpdateStatus(dep.id, 'Failed')}
                            title="Tolak Deposit"
                          >
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </>
                      )}
                      {(dep.status === 'Success' || dep.status === 'Failed') && (
                        <span className="text-xs text-muted-foreground italic px-2">Selesai</span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                        disabled={isLoading === dep.id}
                        onClick={() => setDeleteTarget({ id: dep.id, invoice_id: dep.invoice_id })}
                        title="Hapus Deposit"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedProof} onOpenChange={(open) => !open && setSelectedProof(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bukti Transfer</DialogTitle>
          </DialogHeader>
          {selectedProof && (
            <div className="mt-4 flex justify-center bg-black/5 rounded-lg overflow-hidden border">
              <img src={selectedProof} alt="Bukti Transfer" className="max-h-[60vh] object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
