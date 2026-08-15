"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  Sparkles,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useNotification } from "@/components/ui/notification";
import { uploadFile } from "@/app/actions/upload";
import {
  compressImageClient,
  CompressionPresetKey,
  CompressionResult,
} from "@/lib/client-image-compressor";

interface ImageUploadDropzoneProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  preset?: CompressionPresetKey;
  description?: React.ReactNode;
  placeholder?: string;
  previewHeight?: string;
  previewClass?: string;
  disabled?: boolean;
}

export function ImageUploadDropzone({
  label,
  value,
  onChange,
  preset = "banner",
  description,
  placeholder = "https://...",
  previewHeight = "h-32",
  previewClass = "object-contain",
  disabled = false,
}: ImageUploadDropzoneProps) {
  const { showNotification } = useNotification();
  const [uploading, setUploading] = React.useState(false);
  const [compressing, setCompressing] = React.useState(false);
  const [stats, setStats] = React.useState<CompressionResult | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      setStats(null);

      // 1. Client-Side Auto-Compression
      const compressionResult = await compressImageClient(file, preset);
      setStats(compressionResult);
      setCompressing(false);

      // 2. Upload to Cloudflare R2
      setUploading(true);
      const formData = new FormData();
      formData.append("file", compressionResult.file);

      const result = await uploadFile(formData);

      if (result.error) {
        showNotification("error", "Gagal Unggah Gambar", result.error);
        setStats(null);
      } else if (result.url) {
        onChange(result.url);
        const percentSaved = Math.round(compressionResult.ratio * 100);
        showNotification(
          "success",
          "Unggah Berhasil",
          percentSaved > 0
            ? `Terkonversi ke WebP! Ukuran hemat ${percentSaved}% (${compressionResult.formattedOriginal} ➔ ${compressionResult.formattedCompressed})`
            : "Gambar berhasil diunggah ke R2 Storage."
        );
      }
    } catch (err: any) {
      showNotification("error", "Gagal Unggah", err.message || "Terjadi kesalahan internal.");
      setStats(null);
    } finally {
      setCompressing(false);
      setUploading(false);
      // Reset input value
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2 border border-border/40 rounded-xl p-3.5 bg-muted/10">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-[10px] font-mono font-normal text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
            preset: {preset}
          </span>
        </label>

        {stats && stats.ratio > 0.05 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-fade-in">
            <Sparkles className="w-3 h-3" />
            <span>
              Hemat {Math.round(stats.ratio * 100)}% ({stats.formattedOriginal} ➔ {stats.formattedCompressed})
            </span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label
          className={`flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold hover:bg-muted/50 transition-colors shrink-0 shadow-xs ${
            uploading || compressing || disabled ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          {compressing ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin text-amber-400" />
              <span>Mengompres...</span>
            </>
          ) : uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              <span>Mengunggah...</span>
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4 text-primary" />
              <span>Upload Gambar</span>
            </>
          )}
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading || compressing || disabled}
          />
        </label>

        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          disabled={uploading || compressing || disabled}
          className="flex-1 font-mono text-xs"
        />

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              onChange("");
              setStats(null);
            }}
            title="Hapus URL Gambar"
            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {value && (
        <div
          className={`mt-2 relative w-full ${previewHeight} rounded-lg overflow-hidden border border-border/50 bg-black/40 shadow-inner flex items-center justify-center`}
        >
          <Image
            src={value}
            alt={label}
            fill
            sizes="600px"
            className={previewClass}
          />
        </div>
      )}

      {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
    </div>
  );
}
