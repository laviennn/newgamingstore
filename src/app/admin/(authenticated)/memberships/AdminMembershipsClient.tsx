"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useNotification } from "@/components/ui/notification";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Crown, CheckCircle2, Star } from "lucide-react";
import { PackageFormModal } from "./PackageFormModal";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { Currency, formatCurrency } from "@/lib/currencyUtils";

export function AdminMembershipsClient({ initialPackages, currentTenantId, currency = 'IDR' }: { initialPackages: any[], currentTenantId: string, currency?: Currency }) {
  const { showNotification, NotificationComponent } = useNotification();
  const supabase = createClient();
  const [packages, setPackages] = useState(initialPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pkgToDelete, setPkgToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: any) => {
    setEditingPkg(pkg);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (pkg: any) => {
    setPkgToDelete(pkg);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pkgToDelete) return;
    setIsDeleting(true);
    try {
      if (!currentTenantId) throw new Error("No tenant selected");
      const { error } = await supabase.from("membership_packages").delete().eq("id", pkgToDelete.id).eq("tenant_id", currentTenantId);
      if (error) throw error;
      setPackages(prev => prev.filter(p => p.id !== pkgToDelete.id));
      showNotification("success", "Terhapus", "Paket berhasil dihapus.");
    } catch (err: any) {
      showNotification("error", "Gagal Hapus", err.message || "Terjadi kesalahan.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setPkgToDelete(null);
    }
  };

  const handleSavePackage = async (data: any) => {
    try {
      if (data.id) {
        // Update
        const { error } = await supabase
          .from("membership_packages")
          .update({
            name: data.name,
            price: data.price,
            period_label: data.period_label,
            benefits: data.benefits,
            is_popular: data.is_popular,
            is_active: data.is_active,
          })
          .eq("id", data.id)
          .eq("tenant_id", currentTenantId);

        if (error) throw error;

        setPackages(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p));
        showNotification("success", "Tersimpan", "Paket membership berhasil diperbarui.");
      } else {
        // Insert
        const { data: inserted, error } = await supabase
          .from("membership_packages")
          .insert({
            name: data.name,
            price: data.price,
            period_label: data.period_label,
            benefits: data.benefits,
            is_popular: data.is_popular,
            is_active: data.is_active,
            tenant_id: currentTenantId,
          })
          .select()
          .single();

        if (error) throw error;

        setPackages(prev => [...prev, inserted]);
        showNotification("success", "Berhasil Dibuat", "Paket membership baru telah ditambahkan.");
      }
    } catch (err: any) {
      showNotification("error", "Gagal Menyimpan", err.message || "Terjadi kesalahan.");
      throw err;
    }
  };

  return (
    <div className="space-y-4">
      {NotificationComponent}

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Paket Starter (Gratis) di-hardcode secara otomatis di halaman member. Paket di bawah ini adalah paket bertingkat yang dapat dibeli oleh member.
        </p>
        <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Tambah Paket Membership
        </Button>
      </div>

      <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
              <tr>
                <th className="px-4 py-3">Nama Paket</th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span>Harga</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                      {currency === 'MYR' ? '🇲🇾 RM' : '🇮🇩 Rp'}
                    </span>
                    <span>& Periode</span>
                  </div>
                </th>
                <th className="px-4 py-3">Keuntungan (Benefits)</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Starter Package (Hardcoded display) */}
              <tr className="bg-muted/10">
                <td className="px-4 py-3 font-bold text-foreground flex items-center gap-2">
                  <Crown className="w-4 h-4 text-gray-400" />
                  <span>Starter (Default)</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground font-semibold">Gratis</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  Standard Reseller Perks (Hardcoded Default)
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                    DEFAULT
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground italic">
                  Built-in
                </td>
              </tr>

              {/* Dynamic Packages */}
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Belum ada paket membership dinamis. Klik tombol "Tambah Paket Membership" untuk membuat.
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <Crown className="w-4 h-4 text-blue-500" />
                        <span>{pkg.name}</span>
                        {pkg.is_popular && (
                          <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-blue-500/20">
                            <Star className="w-3 h-3 fill-blue-500" /> POPULER
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-primary">
                        {formatCurrency(Number(pkg.price), currency)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">{pkg.period_label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {Array.isArray(pkg.benefits) && pkg.benefits.slice(0, 3).map((b: string, idx: number) => (
                          <div key={idx} className="text-xs flex items-center gap-1.5 text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))}
                        {Array.isArray(pkg.benefits) && pkg.benefits.length > 3 && (
                          <div className="text-[10px] text-blue-400 font-medium">
                            +{pkg.benefits.length - 3} keuntungan lainnya
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        pkg.is_active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {pkg.is_active ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(pkg)}
                          title="Edit Paket"
                        >
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => handleDeleteClick(pkg)}
                          title="Hapus Paket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PackageFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePackage}
        pkgToEdit={editingPkg}
        currency={currency}
      />

      <ConfirmDeleteDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Paket Membership"
        description="Apakah Anda yakin ingin menghapus paket ini? Aksi ini tidak dapat dibatalkan."
        itemName={pkgToDelete?.name}
        loading={isDeleting}
      />
    </div>
  );
}
