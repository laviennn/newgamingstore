"use client";

import { SkeuoStatusBadge } from "@/components/ui/skeuo-switch";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { deletePayment, togglePaymentStatus } from "@/app/admin/payments/actions";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { useNotification } from "@/components/ui/notification";
import { Trash2, Edit, Plus, CheckCircle, XCircle } from "lucide-react";
import { PaymentFormModal } from "@/components/admin/PaymentFormModal";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PaymentClient({ initialPayments }: { initialPayments: any[] }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPayment, setSelectedPayment] = React.useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (payment: any) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedPayment(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    const result = await togglePaymentStatus(id, currentStatus);
    if (result.error) {
      showNotification("error", "Gagal Mengubah Status", result.error);
    } else {
      showNotification("success", "Status Diperbarui", `Metode ${name} sekarang ${!currentStatus ? 'Aktif' : 'Nonaktif'}.`);
    }
  };

  const [deleteState, setDeleteState] = React.useState<{ isOpen: boolean; id: string; name: string; loading: boolean }>({
    isOpen: false,
    id: "",
    name: "",
    loading: false,
  });

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteState({ isOpen: true, id, name, loading: false });
  };

  const confirmDelete = async () => {
    setDeleteState(prev => ({ ...prev, loading: true }));
    const result = await deletePayment(deleteState.id);
    if (result.error) {
      showNotification("error", "Gagal Menghapus", result.error);
      setDeleteState(prev => ({ ...prev, loading: false }));
    } else if (result.deactivated) {
      showNotification("info", "Status Di-nonaktifkan", result.message || `Metode ${deleteState.name} telah dinonaktifkan.`);
      setDeleteState({ isOpen: false, id: "", name: "", loading: false });
    } else {
      showNotification("success", "Terhapus", `Metode ${deleteState.name} berhasil dihapus.`);
      setDeleteState({ isOpen: false, id: "", name: "", loading: false });
    }
  };

  const fixUrl = (url: string | null) => {
    if (!url) return '';
    return url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com');
  };

  return (
    <>
      {NotificationComponent}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metode Pembayaran</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola channel pembayaran bank & e-wallet yang tampil di Footer.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Pembayaran
        </Button>
      </div>

      <div className="relative w-full overflow-auto bg-card rounded-xl border shadow-sm">
        <table className="w-full caption-bottom text-sm text-left">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 font-medium w-24 text-center">Logo</th>
              <th className="h-12 px-4 font-medium">Informasi Bank / Channel</th>
              <th className="h-12 px-4 font-medium text-center">Kategori</th>
              <th className="h-12 px-4 font-medium text-center">Status</th>
              <th className="h-12 px-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {initialPayments.map((p) => (
              <tr key={p.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 text-center">
                  <div className="relative w-16 h-8 rounded bg-white border mx-auto flex items-center justify-center overflow-hidden">
                    {p.logo_url ? (
                      <Image src={fixUrl(p.logo_url)} alt={p.name} fill sizes="64px" className="object-contain p-0.5" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-medium">{p.name}</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-bold">{p.name}</div>
                  {(p.account_number || p.account_name) && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.account_number} {p.account_name ? `a/n ${p.account_name}` : ''}
                    </div>
                  )}
                </td>
                <td className="p-4 text-center text-muted-foreground text-xs font-semibold">
                  {p.category}
                </td>
                <td className="p-4 text-center">
                  <SkeuoStatusBadge
                    checked={p.is_active ?? true}
                    onToggle={() => handleToggleStatus(p.id, p.is_active ?? true, p.name)}
                    activeText="Aktif"
                    inactiveText="Nonaktif"
                  />
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(p)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteClick(p.id, p.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {initialPayments.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Belum ada metode pembayaran yang dikonfigurasi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaymentFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        payment={selectedPayment} 
      />

      <ConfirmDeleteDialog 
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Hapus Pembayaran"
        description="Apakah Anda yakin ingin menghapus metode pembayaran ini?"
        itemName={deleteState.name}
        loading={deleteState.loading}
      />
    </>
  );
}
