"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";
import { createMember } from "@/app/admin/(authenticated)/members/actions";
import { useNotification } from "@/components/ui/notification";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemberFormModal({ isOpen, onClose }: MemberFormModalProps) {
  const { showNotification, NotificationComponent } = useNotification();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createMember(formData);

    setLoading(false);

    if (result.error) {
      showNotification("error", "Gagal", result.error);
    } else {
      showNotification("success", "Berhasil", "Member berhasil didaftarkan.");
      setTimeout(() => onClose(), 800);
    }
  };

  return (
    <>
      {NotificationComponent}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200 border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Daftarkan Member</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">Username</label>
            <Input
              id="username"
              name="username"
              placeholder="contoh: johndoe"
              required
              pattern="[a-z0-9_]{3,20}"
              title="3-20 karakter: huruf kecil, angka, underscore"
            />
            <p className="text-xs text-muted-foreground">Digunakan member untuk login di storefront.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Nomor Telepon (opsional)</label>
            <Input id="phone" name="phone" type="tel" placeholder="081234567890" />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <Input id="password" name="password" type="password" placeholder="Minimal 6 karakter" required minLength={6} />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Member"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
