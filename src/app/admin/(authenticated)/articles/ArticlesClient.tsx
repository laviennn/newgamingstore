"use client";

import { SkeuoStatusBadge } from "@/components/ui/skeuo-switch";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { deleteArticle, toggleArticleStatus } from "@/app/admin/(authenticated)/articles/actions";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { useNotification } from "@/components/ui/notification";
import { Trash2, Edit, Plus, CheckCircle, XCircle } from "lucide-react";
import { ArticleFormModal } from "@/components/admin/ArticleFormModal";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ArticlesClient({ initialArticles }: { initialArticles: any[] }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedArticle, setSelectedArticle] = React.useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (article: any) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, title: string) => {
    const result = await toggleArticleStatus(id, currentStatus);
    if (result.error) {
      showNotification("error", "Gagal Mengubah Status", result.error);
    } else {
      showNotification(
        "success",
        "Status Diperbarui",
        `Artikel "${title}" sekarang ${!currentStatus ? "Publish" : "Draft"}.`
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
    const result = await deleteArticle(deleteState.id);
    if (result.error) {
      showNotification("error", "Gagal Menghapus", result.error);
      setDeleteState(prev => ({ ...prev, loading: false }));
    } else {
      showNotification("success", "Terhapus", `Artikel "${deleteState.name}" berhasil dihapus.`);
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
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Artikel / Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola artikel blog untuk berita, tutorial, dan promo.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Tulis Artikel
        </Button>
      </div>

      <div className="relative w-full overflow-auto bg-card rounded-xl border shadow-sm">
        <table className="w-full caption-bottom text-sm text-left">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 font-medium w-16 text-center">Thumb</th>
              <th className="h-12 px-4 font-medium">Judul & Slug</th>
              <th className="h-12 px-4 font-medium text-center">Penulis</th>
              <th className="h-12 px-4 font-medium text-center">Tanggal</th>
              <th className="h-12 px-4 font-medium text-center">Status</th>
              <th className="h-12 px-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {initialArticles.map((a) => (
              <tr key={a.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 text-center">
                  <div className="relative w-12 h-12 rounded-lg bg-muted border overflow-hidden mx-auto">
                    {a.image_url ? (
                      <Image src={fixUrl(a.image_url)} alt={a.title} fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Img</div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium line-clamp-1">{a.title}</div>
                  <div className="font-mono text-xs text-muted-foreground mt-1">/{a.slug}</div>
                </td>
                <td className="p-4 text-center text-muted-foreground">{a.author}</td>
                <td className="p-4 text-center text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="p-4 text-center">
                  <SkeuoStatusBadge
                    checked={a.is_published ?? true}
                    onToggle={() => handleToggleStatus(a.id, a.is_published ?? true, a.title)}
                    activeText="Publish"
                    inactiveText="Draft"
                  />
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(a)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteClick(a.id, a.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {initialArticles.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Belum ada artikel. Klik "Tulis Artikel" untuk membuat baru!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ArticleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={selectedArticle}
      />

      <ConfirmDeleteDialog 
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Hapus Artikel"
        description="Apakah Anda yakin ingin menghapus artikel ini?"
        itemName={deleteState.name}
        loading={deleteState.loading}
      />
    </>
  );
}
