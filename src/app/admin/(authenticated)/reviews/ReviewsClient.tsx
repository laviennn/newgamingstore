"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotification } from "@/components/ui/notification";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { createReview, updateReview, deleteReview } from "./actions";

export function ReviewsClient({ initialReviews, games, products }: { initialReviews: any[], games: any[], products: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", game_id: "", product_id: "", reviewer_name: "", rating: 5, comment: "" });
  const [loading, setLoading] = useState(false);
  const [deleteState, setDeleteState] = useState<{ isOpen: boolean; id: string; loading: boolean }>({
    isOpen: false,
    id: "",
    loading: false,
  });
  const { showNotification, NotificationComponent } = useNotification();

  const handleOpenDialog = (review?: any) => {
    if (review) {
      setFormData({
        id: review.id,
        game_id: review.game_id,
        product_id: review.product_id || "",
        reviewer_name: review.reviewer_name,
        rating: review.rating,
        comment: review.comment || "",
      });
    } else {
      setFormData({ id: "", game_id: "", product_id: "", reviewer_name: "", rating: 5, comment: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.game_id || !formData.reviewer_name || !formData.rating) return;
    
    setLoading(true);
    try {
      const dataToSave = {
        game_id: formData.game_id,
        product_id: formData.product_id && formData.product_id !== "none" ? formData.product_id : null,
        reviewer_name: formData.reviewer_name,
        rating: formData.rating,
        comment: formData.comment,
      };

      let res;
      if (formData.id) {
        res = await updateReview(formData.id, dataToSave);
      } else {
        res = await createReview(dataToSave);
      }

      if (res.success) {
        showNotification("success", "Berhasil", `Review berhasil ${formData.id ? 'diperbarui' : 'ditambahkan'}`);
        setIsDialogOpen(false);
        window.location.reload(); 
      } else {
        showNotification("error", "Gagal", res.message || "Terjadi kesalahan");
      }
    } catch (err: any) {
      showNotification("error", "Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await deleteReview(deleteState.id);
      if (res.success) {
        showNotification("success", "Berhasil", "Review berhasil dihapus");
        setDeleteState({ isOpen: false, id: "", loading: false });
        window.location.reload();
      } else {
        showNotification("error", "Gagal", res.message || "Terjadi kesalahan");
        setDeleteState((prev) => ({ ...prev, loading: false }));
      }
    } catch (err: any) {
      showNotification("error", "Error", err.message);
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  const filteredProducts = products.filter(p => p.game_id === formData.game_id);

  return (
    <div className="space-y-6">
      {NotificationComponent}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground mt-1 text-sm">Kelola ulasan pembeli untuk ditampilkan di halaman game.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Review
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reviewer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Game & Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rating</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Comment</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4 font-medium">{r.reviewer_name}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-primary">{r.games?.name}</p>
                    <p className="text-xs text-muted-foreground">{r.products?.name || "-"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {r.rating} <Star className="w-4 h-4 fill-current" />
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-[200px] truncate text-muted-foreground" title={r.comment}>
                    {r.comment || "-"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(r)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteState({ isOpen: true, id: r.id, loading: false })} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Belum ada review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Edit Review" : "Tambah Review"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Game <span className="text-red-500">*</span></Label>
              <Select value={formData.game_id} onValueChange={(val) => setFormData({ ...formData, game_id: val, product_id: "" })}>
                <SelectTrigger className="w-full bg-background border-border/50 hover:bg-muted/50 transition-colors">
                  <SelectValue placeholder="Pilih Game">
                    {games.find(g => g.id === formData.game_id)?.name || "Pilih Game"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {games.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Produk</Label>
              <Select value={formData.product_id} onValueChange={(val) => setFormData({ ...formData, product_id: val })} disabled={!formData.game_id}>
                <SelectTrigger className="w-full bg-background border-border/50 hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Pilih Produk">
                    {formData.product_id === "none" ? "-- Tidak Memilih Produk --" : (filteredProducts.find(p => p.id === formData.product_id)?.name || "Pilih Produk")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Tidak Memilih Produk --</SelectItem>
                  {filteredProducts.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nama Reviewer <span className="text-red-500">*</span></Label>
              <Input 
                value={formData.reviewer_name} 
                onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })} 
                placeholder="Cth: Ali Ahmad" 
                required 
              />
              <p className="text-[11px] text-muted-foreground">Nama akan disensor sebagian secara otomatis di halaman Storefront (Cth: A** d).</p>
            </div>

            <div className="space-y-2">
              <Label>Rating <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`p-1 rounded-md transition-colors ${formData.rating >= star ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500/50'}`}
                  >
                    <Star className={`w-6 h-6 ${formData.rating >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Komentar</Label>
              <Textarea 
                value={formData.comment} 
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })} 
                placeholder="Tulis ulasan disini..." 
                rows={3} 
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, id: "", loading: false })}
        onConfirm={handleDelete}
        title="Hapus Review"
        description="Apakah Anda yakin ingin menghapus review ini? Tindakan ini tidak dapat dibatalkan."
        loading={deleteState.loading}
      />
    </div>
  );
}
