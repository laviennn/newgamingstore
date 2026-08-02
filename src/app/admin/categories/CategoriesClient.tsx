"use client";

import { SkeuoStatusBadge } from "@/components/ui/skeuo-switch";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { deleteCategory, toggleCategoryStatus } from "@/app/admin/categories/actions";
import { useNotification } from "@/components/ui/notification";
import { Trash2, Edit, Plus, CheckCircle, XCircle } from "lucide-react";
import { CategoryFormModal } from "@/components/admin/CategoryFormModal";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { Gamepad2, Sparkles, Ticket, Wallet, Globe, Tv, Flame } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Gamepad2: <Gamepad2 className="w-4 h-4 text-blue-400" />,
  Sparkles: <Sparkles className="w-4 h-4 text-yellow-400" />,
  Ticket: <Ticket className="w-4 h-4 text-orange-400" />,
  Wallet: <Wallet className="w-4 h-4 text-green-400" />,
  Globe: <Globe className="w-4 h-4 text-cyan-400" />,
  Tv: <Tv className="w-4 h-4 text-purple-400" />,
  Flame: <Flame className="w-4 h-4 text-red-400" />,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCategory, setSelectedCategory] = React.useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (cat: any) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    const result = await toggleCategoryStatus(id, currentStatus);
    if (result.error) {
      showNotification("error", "Gagal Mengubah Status", result.error);
    } else {
      showNotification(
        "success",
        "Status Diperbarui",
        `Kategori "${name}" sekarang ${!currentStatus ? "Aktif (Enable)" : "Nonaktif (Disabled)"}.`
      );
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
    const result = await deleteCategory(deleteState.id);
    if (result.error) {
      showNotification("error", "Gagal Menghapus", result.error);
      setDeleteState(prev => ({ ...prev, loading: false }));
    } else {
      showNotification("success", "Terhapus", `Kategori "${deleteState.name}" berhasil dihapus.`);
      setDeleteState({ isOpen: false, id: "", name: "", loading: false });
    }
  };

  return (
    <>
      {NotificationComponent}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Kategori</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola kategori produk dan status penampilannya di Storefront.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      <div className="relative w-full overflow-auto bg-card rounded-xl border shadow-sm">
        <table className="w-full caption-bottom text-sm text-left">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 font-medium w-12 text-center">Icon</th>
              <th className="h-12 px-4 font-medium">Nama Kategori</th>
              <th className="h-12 px-4 font-medium">Slug</th>
              <th className="h-12 px-4 font-medium text-center">Urutan</th>
              <th className="h-12 px-4 font-medium text-center">Status</th>
              <th className="h-12 px-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {initialCategories.map((c) => (
              <tr key={c.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-muted border flex items-center justify-center mx-auto">
                    {ICON_MAP[c.icon_name] || <Gamepad2 className="w-4 h-4" />}
                  </div>
                </td>
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 font-mono text-xs text-muted-foreground">{c.slug}</td>
                <td className="p-4 text-center font-bold">{c.sort_order ?? 0}</td>
                <td className="p-4 text-center">
                  <SkeuoStatusBadge
                    checked={c.is_active ?? true}
                    onToggle={() => handleToggleStatus(c.id, c.is_active ?? true, c.name)}
                    activeText="Enable"
                    inactiveText="Disabled"
                  />
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(c)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteClick(c.id, c.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {initialCategories.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Belum ada kategori. Klik "Tambah Kategori" untuk membuat baru!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />

      <ConfirmDeleteDialog 
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Data yang terkait mungkin akan ikut terpengaruh."
        itemName={deleteState.name}
        loading={deleteState.loading}
      />
    </>
  );
}
