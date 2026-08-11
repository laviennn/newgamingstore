import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnauthorizedAccessProps {
  permission?: string;
  title?: string;
  description?: string;
}

export function UnauthorizedAccess({
  permission,
  title = "Akses Ditolak (403 Unauthorized)",
  description,
}: UnauthorizedAccessProps) {
  const defaultDesc = permission
    ? `Anda tidak memiliki hak akses '${permission}' yang diperlukan untuk membuka atau mengelola halaman ini. Hubungi SuperAdmin jika Anda membutuhkan izin ini.`
    : "Anda tidak memiliki hak akses yang cukup untuk membuka halaman ini. Silakan hubungi SuperAdmin.";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="w-20 h-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-6 shadow-inner border border-destructive/20">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <div className="max-w-md space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 mb-1">
          <Lock className="w-3.5 h-3.5" /> Restricted Area
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description || defaultDesc}
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Overview Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
