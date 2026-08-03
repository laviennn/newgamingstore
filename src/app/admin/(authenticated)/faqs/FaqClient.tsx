"use client";

import { SkeuoStatusBadge } from "@/components/ui/skeuo-switch";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { deleteFaq, toggleFaqStatus } from "@/app/admin/(authenticated)/faqs/actions";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { useNotification } from "@/components/ui/notification";
import { Trash2, Edit, Plus, CheckCircle, XCircle } from "lucide-react";
import { FaqFormModal } from "@/components/admin/FaqFormModal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FaqClient({ initialFaqs }: { initialFaqs: any[] }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedFaq, setSelectedFaq] = React.useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (faq: any) => {
    setSelectedFaq(faq);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedFaq(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleFaqStatus(id, currentStatus);
    if (result.error) {
      showNotification("error", "Gagal Mengubah Status", result.error);
    } else {
      showNotification("success", "Status Diperbarui", "Status FAQ telah diubah.");
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
    const result = await deleteFaq(deleteState.id);
    if (result.error) {
      showNotification("error", "Gagal Menghapus", result.error);
      setDeleteState(prev => ({ ...prev, loading: false }));
    } else {
      showNotification("success", "Terhapus", "FAQ berhasil dihapus.");
      setDeleteState({ isOpen: false, id: "", name: "", loading: false });
    }
  };

  return (
    <>
      {NotificationComponent}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen FAQ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola daftar pertanyaan yang sering ditanyakan di halaman beranda.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah FAQ
        </Button>
      </div>

      <div className="relative w-full overflow-auto bg-card rounded-xl border shadow-sm">
        <table className="w-full caption-bottom text-sm text-left">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 font-medium w-16 text-center">Urutan</th>
              <th className="h-12 px-4 font-medium">Pertanyaan & Jawaban</th>
              <th className="h-12 px-4 font-medium text-center">Status</th>
              <th className="h-12 px-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {initialFaqs.map((f) => (
              <tr key={f.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 text-center font-mono font-medium">{f.sort_order}</td>
                <td className="p-4">
                  <div className="font-semibold">{f.question}</div>
                  <div className="text-muted-foreground line-clamp-1 mt-1 text-xs">{f.answer}</div>
                </td>
                <td className="p-4 text-center">
                  <SkeuoStatusBadge
                    checked={f.is_active ?? true}
                    onToggle={() => handleToggleStatus(f.id, f.is_active ?? true)}
                    activeText="Aktif"
                    inactiveText="Nonaktif"
                  />
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(f)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteClick(f.id, f.question)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {initialFaqs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  Belum ada FAQ.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <FaqFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        faq={selectedFaq} 
      />

      <ConfirmDeleteDialog 
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Hapus FAQ"
        description="Apakah Anda yakin ingin menghapus FAQ ini?"
        itemName={deleteState.name}
        loading={deleteState.loading}
      />
    </>
  );
}
