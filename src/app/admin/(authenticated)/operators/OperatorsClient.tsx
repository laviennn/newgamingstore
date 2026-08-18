"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNotification } from "@/components/ui/notification";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { createOperator, deleteOperator } from "./actions";

interface OperatorsClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialOperators: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roles: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tenants: any[];
  currentTenantId?: string | null;
  isSuperAdmin?: boolean;
}

export function OperatorsClient({
  initialOperators,
  roles,
  tenants,
  currentTenantId,
  isSuperAdmin = false,
}: OperatorsClientProps) {
  const [operators, setOperators] = useState(initialOperators);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", roleId: "", tenantId: "" });
  const [loading, setLoading] = useState(false);
  const [deleteState, setDeleteState] = useState<{ isOpen: boolean; id: string; email: string; loading: boolean }>({
    isOpen: false,
    id: "",
    email: "",
    loading: false,
  });
  const { showNotification, NotificationComponent } = useNotification();

  const activeTenantObj = tenants.find((t) => t.id === currentTenantId) || tenants[0];

  const handleOpenDialog = () => {
    const defaultTenantId = currentTenantId || tenants[0]?.id || "";
    setFormData({
      email: "",
      password: "",
      roleId: roles[0]?.id || "",
      tenantId: defaultTenantId,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const targetTenantId = isSuperAdmin ? formData.tenantId : (currentTenantId || formData.tenantId);
      const res = await createOperator(formData.email, formData.password, formData.roleId, targetTenantId);

      if (res.success) {
        showNotification("success", "Sukses", "Operator berhasil dibuat");
        setIsDialogOpen(false);
        window.location.reload();
      } else {
        showNotification("error", "Gagal", res.message || "Gagal membuat operator");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showNotification("error", "Kesalahan Sistem", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string, email: string) => {
    setDeleteState({ isOpen: true, id, email, loading: false });
  };

  const confirmDelete = async () => {
    setDeleteState((prev) => ({ ...prev, loading: true }));
    const res = await deleteOperator(deleteState.id);
    if (res.success) {
      setOperators(operators.filter((o) => o.id !== deleteState.id));
      showNotification("success", "Terhapus", `Akses operator "${deleteState.email}" berhasil dicabut`);
      setDeleteState({ isOpen: false, id: "", email: "", loading: false });
    } else {
      showNotification("error", "Gagal", res.message || "Gagal menghapus operator");
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-4">
      {NotificationComponent}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Operator</h2>
          {activeTenantObj && (
            <p className="text-sm text-muted-foreground">
              Tenant Aktif: <span className="font-semibold text-foreground">{activeTenantObj.name}</span>
            </p>
          )}
        </div>
        <Button onClick={handleOpenDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Operator
        </Button>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Tenant</th>
              <th className="px-6 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {operators.map((op) => (
              <tr key={op.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium flex items-center gap-2">
                  {op.email}
                  {op.is_superadmin && <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">SuperAdmin</span>}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {op.admin_roles?.name || (op.is_superadmin ? "Full Access" : "-")}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {op.tenants?.name || (op.is_superadmin ? "Semua Tenant" : "-")}
                </td>
                <td className="px-6 py-4 text-right">
                  {!op.is_superadmin && (
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(op.id, op.email)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {operators.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  Belum ada operator untuk tenant ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Operator Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="operator@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="text" // Plain text so Admin can see what they set
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                required
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Assign ke Tenant</Label>
              {isSuperAdmin && tenants.length > 1 ? (
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.tenantId}
                  onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                  required
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              ) : (
                <Input
                  type="text"
                  value={activeTenantObj?.name || "Tenant Aktif"}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed font-medium"
                />
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Buat Operator"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Cabut Akses Operator"
        description="Apakah Anda yakin ingin mencabut akses BO operator ini? Operator tersebut tidak akan dapat login lagi ke Dashboard Admin."
        itemName={deleteState.email}
        loading={deleteState.loading}
      />
    </div>
  );
}

