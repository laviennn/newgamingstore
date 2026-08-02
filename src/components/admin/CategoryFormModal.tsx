"use client";

import { SkeuoToggle } from "@/components/ui/skeuo-switch";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveCategory } from "@/app/admin/categories/actions";
import { useNotification } from "@/components/ui/notification";
import { Loader2 } from "lucide-react";

const ICON_OPTIONS = [
  "Gamepad2",
  "Sparkles",
  "Ticket",
  "Wallet",
  "Globe",
  "Tv",
  "Flame"
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CategoryFormModal({ isOpen, onClose, category }: { isOpen: boolean; onClose: () => void; category?: any }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [loading, setLoading] = React.useState(false);

  const [name, setName] = React.useState(category?.name || "");
  const [slug, setSlug] = React.useState(category?.slug || "");
  const [iconName, setIconName] = React.useState(category?.icon_name || "Gamepad2");
  const [sortOrder, setSortOrder] = React.useState(category?.sort_order ?? 1);
  const [isActive, setIsActive] = React.useState(category?.is_active ?? true);

  React.useEffect(() => {
    setName(category?.name || "");
    setSlug(category?.slug || "");
    setIconName(category?.icon_name || "Gamepad2");
    setSortOrder(category?.sort_order ?? 1);
    setIsActive(category?.is_active ?? true);
  }, [category, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("icon_name", iconName);
    formData.set("sort_order", sortOrder.toString());
    formData.set("is_active", isActive.toString());

    const result = await saveCategory(formData, category?.id);
    setLoading(false);

    if (result.error) {
      showNotification("error", "Gagal Menyimpan", result.error);
    } else {
      showNotification("success", "Berhasil", `Kategori berhasil ${category ? "diperbarui" : "ditambahkan"}!`);
      onClose();
    }
  }

  return (
    <>
      {NotificationComponent}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{category ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nama Kategori</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Top Up Games"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">Slug</label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="top-up-games"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="icon_name" className="text-sm font-medium">Icon</label>
                <select
                  id="icon_name"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="sort_order" className="text-sm font-medium">Urutan (Sort Order)</label>
                <Input
                  id="sort_order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-medium block">Status Publikasi</label>
              <div>
                <SkeuoToggle
                  checked={isActive}
                  onChange={(val) => setIsActive(val)}
                  activeText="Enable (Aktif)"
                  inactiveText="Disabled (Nonaktif)"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Menyimpan..." : "Simpan Kategori"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
