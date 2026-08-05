"use client";

import { useState } from "react";
import { Plus, Trash2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberFormModal } from "@/components/admin/MemberFormModal";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { useNotification } from "@/components/ui/notification";
import { deleteMember } from "./actions";

type MemberRow = {
  id: string;
  username: string;
  phone: string | null;
  created_at: string;
};

interface MembersClientProps {
  initialMembers: MemberRow[];
  authMode: string;
}

export function MembersClient({ initialMembers, authMode }: MembersClientProps) {
  const [members, setMembers] = useState(initialMembers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MemberRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showNotification, NotificationComponent } = useNotification();

  const isUsernameMode = authMode === "username";

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteMember(deleteTarget.id);
    setDeleting(false);

    if (result.error) {
      showNotification("error", "Gagal", result.error);
    } else {
      setMembers(members.filter((m) => m.id !== deleteTarget.id));
      showNotification("success", "Terhapus", `Member @${deleteTarget.username} berhasil dihapus.`);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {NotificationComponent}

      {!isUsernameMode && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Tenant ini menggunakan <strong>Email Auth</strong>. Menu Members hanya aktif saat Auth Mode diset ke <strong>Username Auth</strong> di halaman Tenants.
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Manajemen Member
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Daftarkan member untuk login via username + password di storefront.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2" disabled={!isUsernameMode}>
          <Plus className="h-4 w-4" /> Tambah Member
        </Button>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-medium">Username</th>
              <th className="px-6 py-3 font-medium">Telepon</th>
              <th className="px-6 py-3 font-medium">Terdaftar</th>
              <th className="px-6 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium">@{member.username}</td>
                <td className="px-6 py-4 text-muted-foreground">{member.phone || "-"}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {new Date(member.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={!isUsernameMode}
                    onClick={() => setDeleteTarget(member)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  {isUsernameMode ? "Belum ada member terdaftar." : "Aktifkan Username Auth untuk mengelola member."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MemberFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          window.location.reload();
        }}
      />

      <ConfirmDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Member"
        description="Member tidak akan bisa login lagi setelah dihapus."
        itemName={deleteTarget ? `@${deleteTarget.username}` : undefined}
      />
    </div>
  );
}
