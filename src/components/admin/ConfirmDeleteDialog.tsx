"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus data ini?",
  itemName,
  loading = false
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card/60 backdrop-blur-2xl border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-[24px]">
        {/* Glow effect for danger */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none" />

        <div className="p-6 relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {description}
              {itemName && (
                <span className="block mt-2 font-semibold text-foreground break-all px-4 py-2 bg-background/50 rounded-lg border border-border/50">
                  "{itemName}"
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="p-4 bg-muted/20 border-t border-border/50 flex flex-row gap-3 justify-end items-center sm:justify-end">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
            className="rounded-xl px-6 bg-background/50 border-border/50 hover:bg-background/80 transition-colors shadow-sm"
          >
            Batal
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={loading}
            className="rounded-xl px-6 bg-red-500 hover:bg-red-600 text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_10px_rgba(239,68,68,0.4)] transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
