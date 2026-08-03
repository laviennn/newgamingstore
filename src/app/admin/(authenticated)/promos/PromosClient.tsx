"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { savePromoCode, deletePromoCode } from "./actions";
import { useNotification } from "@/components/ui/notification";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

export function PromosClient({ initialPromos }: { initialPromos: any[] }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [promos, setPromos] = useState(initialPromos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    max_uses: null as number | null,
    is_active: true,
  });

  const handleEdit = (promo: any) => {
    setFormData({
      id: promo.id,
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      max_uses: promo.max_uses,
      is_active: promo.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (promo: any) => {
    setPromoToDelete(promo);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!promoToDelete) return;
    setIsDeleting(true);
    try {
      await deletePromoCode(promoToDelete.id);
      setPromos(promos.filter(p => p.id !== promoToDelete.id));
      showNotification("success", "Berhasil", "Promo berhasil dihapus");
    } catch (e) {
      showNotification("error", "Gagal Menghapus", "Error deleting promo code");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setPromoToDelete(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await savePromoCode(formData);
      // Simpan state secara optimistik atau bisa trigger refresh
      if (formData.id) {
        setPromos(promos.map(p => p.id === formData.id ? { ...p, ...formData } : p));
      } else {
        setPromos([{ ...formData, id: Math.random().toString(), used_count: 0, created_at: new Date() }, ...promos]);
      }
      setIsModalOpen(false);
      showNotification("success", "Berhasil", "Promo berhasil disimpan");
    } catch (error: any) {
      showNotification("error", "Gagal Update", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
          <p className="text-muted-foreground mt-2">
            Kelola kode promo untuk diskon pelanggan.
          </p>
        </div>
        <Button onClick={() => {
          setFormData({ id: "", code: "", discount_type: "percentage", discount_value: 0, max_uses: null, is_active: true });
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Promo
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {promos.map((promo) => (
          <Card key={promo.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-bold text-xl">{promo.code}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Diskon: {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `Rp ${promo.discount_value.toLocaleString()}`}
                  {promo.max_uses && ` | Maksimal Penggunaan: ${promo.used_count}/${promo.max_uses}`}
                </p>
                <div className={`mt-2 inline-flex text-xs px-2 py-1 rounded-full ${promo.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {promo.is_active ? 'Aktif' : 'Tidak Aktif'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(promo)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(promo)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit Promo' : 'Tambah Promo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Kode Promo</Label>
              <Input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="Contoh: DISKON10K" />
            </div>
            <div className="space-y-2">
              <Label>Tipe Diskon</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})}>
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal Tetap (Rp)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Nilai Diskon</Label>
              <Input type="number" required value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>Batas Penggunaan (Opsional)</Label>
              <Input type="number" value={formData.max_uses || ''} onChange={e => setFormData({...formData, max_uses: e.target.value ? parseInt(e.target.value) : null})} placeholder="Kosongkan jika tanpa batas" />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4" />
              <Label htmlFor="isActive">Promo Aktif</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {NotificationComponent}

      <ConfirmDeleteDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Promo"
        description="Apakah Anda yakin ingin menghapus kode promo ini?"
        itemName={promoToDelete?.code}
        loading={isDeleting}
      />
    </div>
  );
}
