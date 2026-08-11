"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNotification } from "@/components/ui/notification";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { createRole, updateRole, deleteRole } from "./actions";

const AVAILABLE_PERMISSIONS = [
  { category: "Katalog & Layanan", perms: [
    { id: "manage_games", label: "Manage Games" },
    { id: "manage_categories", label: "Manage Categories" },
    { id: "manage_products", label: "Manage Products" },
  ]},
  { category: "Transaksi & Promo", perms: [
    { id: "manage_orders", label: "Manage Orders" },
    { id: "manage_deposits", label: "Manage Deposits" },
    { id: "manage_payments", label: "Manage Payments" },
    { id: "manage_promos", label: "Manage Promos" },
    { id: "manage_memberships", label: "Manage Memberships" },
    { id: "manage_members", label: "Manage Members" },
  ]},
  { category: "Konten & Informasi", perms: [
    { id: "manage_content", label: "Settings Contents & Settings" },
    { id: "manage_articles", label: "Manage Articles" },
    { id: "manage_faqs", label: "Manage FAQs" },
    { id: "manage_contacts", label: "Manage Contacts" },
  ]},
  { category: "Pengaturan Sistem", perms: [
    { id: "manage_theme", label: "Theme & Branding" },
    { id: "manage_roles", label: "Manage Roles & Perms" },
    { id: "manage_operators", label: "Manage Operators" },
  ]},
];

export function RolesClient({ initialRoles }: { initialRoles: any[] }) {
  const [roles, setRoles] = useState(initialRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", permissions: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [deleteState, setDeleteState] = useState<{ isOpen: boolean; id: string; name: string; loading: boolean }>({
    isOpen: false,
    id: "",
    name: "",
    loading: false,
  });
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

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteState({ isOpen: true, id, name, loading: false });
  };

  const confirmDelete = async () => {
    setDeleteState(prev => ({ ...prev, loading: true }));
    const res = await deleteRole(deleteState.id);
    if (res.success) {
      setRoles(roles.filter(r => r.id !== deleteState.id));
      showNotification("success", "Terhapus", `Role "${deleteState.name}" berhasil dihapus`);
      setDeleteState({ isOpen: false, id: "", name: "", loading: false });
    } else {
      showNotification("error", "Gagal", res.message || "Gagal menghapus role");
      setDeleteState(prev => ({ ...prev, loading: false }));
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
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(role.id, role.name)}>
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
            <div className="space-y-4 mt-4 border-t pt-4">
              <div>
                <Label className="text-base font-semibold">Permissions</Label>
                <p className="text-sm text-muted-foreground mb-4">Centang fitur yang dapat diakses oleh Role ini.</p>
              </div>
              <div className="space-y-6">
                {AVAILABLE_PERMISSIONS.map((group) => (
                  <div key={group.category} className="space-y-3">
                    <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">{group.category}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.perms.map((perm) => (
                        <label 
                          key={perm.id} 
                          className={`flex items-center space-x-3 border p-3 rounded-xl cursor-pointer transition-all ${
                            formData.permissions.includes(perm.id) 
                              ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' 
                              : 'bg-background hover:bg-muted/50 border-border/60'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(perm.id)}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
                            />
                          </div>
                          <span className={`text-sm ${formData.permissions.includes(perm.id) ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                            {perm.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Hapus Role"
        description="Apakah Anda yakin ingin menghapus role ini? Operator dengan role ini mungkin akan kehilangan akses yang relevan."
        itemName={deleteState.name}
        loading={deleteState.loading}
      />
    </div>
  );
}
