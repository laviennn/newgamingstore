"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkgData: any) => Promise<void>;
  pkgToEdit?: any | null;
}

export function PackageFormModal({ isOpen, onClose, onSave, pkgToEdit }: PackageFormModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">(0);
  const [periodLabel, setPeriodLabel] = useState("/Tahun");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pkgToEdit) {
      setName(pkgToEdit.name || "");
      setPrice(pkgToEdit.price || 0);
      setPeriodLabel(pkgToEdit.period_label || "/Tahun");
      setBenefits(Array.isArray(pkgToEdit.benefits) ? pkgToEdit.benefits : []);
      setIsPopular(pkgToEdit.is_popular ?? false);
      setIsActive(pkgToEdit.is_active ?? true);
    } else {
      setName("");
      setPrice(0);
      setPeriodLabel("/Tahun");
      setBenefits([]);
      setIsPopular(false);
      setIsActive(true);
    }
  }, [pkgToEdit, isOpen]);

  const handleAddBenefit = () => {
    if (!newBenefit.trim()) return;
    setBenefits([...benefits, newBenefit.trim()]);
    setNewBenefit("");
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        id: pkgToEdit?.id,
        name: name.trim(),
        price: Number(price) || 0,
        period_label: periodLabel,
        benefits,
        is_popular: isPopular,
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pkgToEdit ? "Edit Paket Membership" : "Tambah Paket Membership Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Paket</Label>
            <Input
              id="name"
              placeholder="Contoh: Platinum, Gold VIP"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                placeholder="550000"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodLabel">Periode Pembayaran</Label>
              <Input
                id="periodLabel"
                placeholder="/Tahun, /Bulan"
                value={periodLabel}
                onChange={(e) => setPeriodLabel(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Benefits List Manager */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-semibold">Daftar Keuntungan Member (Checkmark Benefits)</Label>
            
            <div className="flex gap-2">
              <Input
                placeholder="Tambah keunggulan (misal: Potongan Harga Rp 500/produk)"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBenefit();
                  }
                }}
              />
              <Button type="button" onClick={handleAddBenefit} variant="secondary" className="shrink-0">
                <Plus className="w-4 h-4 mr-1" /> Tambah
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
              {benefits.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Belum ada keuntungan ditambahkan.</p>
              ) : (
                benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-muted/40 p-2.5 rounded-lg border text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{b}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => handleRemoveBenefit(idx)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between pt-3 border-t">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded border-gray-300 w-4 h-4 text-blue-600"
              />
              <span>Tandai Sebagai Paket Populer (Rekomendasi)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 w-4 h-4 text-blue-600"
              />
              <span>Status Aktif</span>
            </label>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {pkgToEdit ? "Simpan Perubahan" : "Buat Paket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
