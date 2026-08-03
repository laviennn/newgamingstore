"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNotification } from "@/components/ui/notification";
import { createRole, updateRole, deleteRole } from "./actions";

const AVAILABLE_PERMISSIONS = [
  { id: "manage_games", label: "Manage Games" },
  { id: "manage_categories", label: "Manage Categories" },
  { id: "manage_products", label: "Manage Products" },
  { id: "manage_articles", label: "Manage Articles" },
  { id: "manage_faqs", label: "Manage FAQs" },
  { id: "manage_payments", label: "Manage Payments" },
  { id: "manage_promos", label: "Manage Promos" },
  { id: "manage_orders", label: "Manage Orders" },
  { id: "manage_memberships", label: "Manage Memberships" },
  { id: "manage_deposits", label: "Manage Deposits" },
  { id: "manage_tenants", label: "Manage Tenants" },
  { id: "manage_theme", label: "Manage Theme" },
  { id: "manage_contacts", label: "Manage Contacts" },
  { id: "manage_content", label: "Manage Content" }
];

export function RolesClient({ initialRoles }: { initialRoles: any[] }) {
  const [roles, setRoles] = useState(initialRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", permissions: [] as string[] });
  const [loading, setLoading] = useState(false);
  const { showNotification, NotificationComponent } = useNotification();

  const handleOpenDialog = (role?: any) => {
    if (role) {
      setFormData({ id: role.id, name: role.name, permissions: role.permissions || [] });
    } else {
      setFormData({ id: "", name: "", permissions: [] });
    }
    setIsDialogOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => {
      const perms = prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: perms };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (formData.id) {
        res = await updateRole(formData.id, formData.name, formData.permissions);
      } else {
        res = await createRole(formData.name, formData.permissions);
      }

      if (res.success) {
        showNotification("success", "Sukses", "Role berhasil disimpan");
        setIsDialogOpen(false);
        // Normally we'd fetch updated data or use router.refresh
        // For local state we can just refresh the page for simplicity
        window.location.reload();
      } else {
        showNotification("error", "Gagal", res.message || "Gagal menyimpan role");
      }
    } catch (err: any) {
      showNotification("error", "Kesalahan Sistem", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus role ini?")) return;
    const res = await deleteRole(id);
    if (res.success) {
      setRoles(roles.filter(r => r.id !== id));
      showNotification("success", "Terhapus", "Role berhasil dihapus");
    } else {
      showNotification("error", "Gagal", res.message || "Gagal menghapus");
    }
  };

  return (
    <div className="space-y-4">
      {NotificationComponent}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Manajemen Role</h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Role
        </Button>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-medium">Nama Role</th>
              <th className="px-6 py-3 font-medium">Permissions</th>
              <th className="px-6 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium">{role.name}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {role.permissions.length} akses diizinkan
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleOpenDialog(role)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(role.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                  Belum ada role.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? "Edit Role" : "Tambah Role"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Nama Role</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <label key={perm.id} className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm.id)}
                      onChange={() => handleTogglePermission(perm.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
