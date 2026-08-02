"use client";

import { SkeuoToggle } from "@/components/ui/skeuo-switch";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePayment } from "@/app/admin/payments/actions";
import { uploadFile } from "@/app/actions/upload";
import { useNotification } from "@/components/ui/notification";
import { Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PaymentFormModal({ isOpen, onClose, payment }: { isOpen: boolean; onClose: () => void; payment?: any }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [category, setCategory] = React.useState(payment?.category || "Bank Transfer");
  const [name, setName] = React.useState(payment?.name || "");
  const [accountNumber, setAccountNumber] = React.useState(payment?.account_number || "");
  const [accountName, setAccountName] = React.useState(payment?.account_name || "");
  const [logoPreview, setLogoPreview] = React.useState<string | null>(payment?.logo_url || null);
  const [qrPreview, setQrPreview] = React.useState<string | null>(payment?.qr_image_url || null);
  const [isActive, setIsActive] = React.useState(payment?.is_active ?? true);

  React.useEffect(() => {
    setCategory(payment?.category || "Bank Transfer");
    setName(payment?.name || "");
    setAccountNumber(payment?.account_number || "");
    setAccountName(payment?.account_name || "");
    setLogoPreview(payment?.logo_url || null);
    setQrPreview(payment?.qr_image_url || null);
    setIsActive(payment?.is_active ?? true);
  }, [payment, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isQr: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadFile(formData);
    
    if (result.error) {
      showNotification("error", "Upload Gagal", result.error);
    } else if (result.url) {
      if (isQr) {
        setQrPreview(result.url);
      } else {
        setLogoPreview(result.url);
      }
    }
    setUploading(false);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("category", category);
    formData.set("name", name);
    formData.set("account_number", accountNumber);
    formData.set("account_name", accountName);
    formData.set("logo_url", logoPreview || "");
    formData.set("qr_image_url", qrPreview || "");
    formData.set("is_active", isActive.toString());

    const result = await savePayment(formData, payment?.id);
    
    setLoading(false);
    
    if (result.error) {
      showNotification("error", "Error", result.error);
    } else {
      showNotification("success", "Berhasil", `Metode Pembayaran berhasil disimpan!`);
      onClose();
    }
  }

  const fixUrl = (url: string | null) => {
    if (!url) return '';
    return url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com');
  };

  return (
    <>
      {NotificationComponent}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{payment ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="QRIS">QRIS</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="E-Wallet">E-Wallet</option>
                  <option value="Convenience Store">Convenience Store</option>
                  <option value="Virtual Account">Virtual Account</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Metode (Cth: BCA)</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="BCA / OVO / Dana"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Logo Bank / E-Wallet</label>
              <div className="flex gap-4 items-center">
                 <div className="relative w-16 h-10 bg-white rounded border overflow-hidden flex items-center justify-center shrink-0">
                   {logoPreview ? (
                      <Image src={fixUrl(logoPreview)} alt="Logo" fill className="object-contain p-1" />
                   ) : (
                      <span className="text-[10px] text-muted-foreground">No Logo</span>
                   )}
                 </div>
                 <label className="flex flex-1 h-10 cursor-pointer items-center justify-center rounded-md border border-dashed bg-background px-3 py-2 text-sm hover:bg-muted/50">
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    <span>{uploading ? "Uploading..." : "Upload Logo (R2)"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, false)} disabled={uploading} />
                 </label>
              </div>
            </div>

            {category === "QRIS" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-500">Barcode QRIS Static (Wajib untuk QRIS)</label>
                <div className="flex gap-4 items-center">
                   <div className="relative w-16 h-16 bg-white rounded border overflow-hidden flex items-center justify-center shrink-0">
                     {qrPreview ? (
                        <Image src={fixUrl(qrPreview)} alt="QR Code" fill className="object-contain p-1" />
                     ) : (
                        <span className="text-[10px] text-muted-foreground">No QR</span>
                     )}
                   </div>
                   <label className="flex flex-1 h-16 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/30 px-3 py-2 text-sm text-blue-500 transition-colors">
                      {uploading ? <Loader2 className="mb-1 h-4 w-4 animate-spin" /> : <UploadCloud className="mb-1 h-4 w-4" />}
                      <span className="font-semibold">{uploading ? "Uploading..." : "Upload QRIS (R2)"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} disabled={uploading} />
                   </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">No. Rekening / No. HP</label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Atas Nama</label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="PT. Yowana Store"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium block">Status Tampil di Footer</label>
              <div>
                <SkeuoToggle
                  checked={isActive}
                  onChange={(val) => setIsActive(val)}
                  activeText="Aktif"
                  inactiveText="Nonaktif"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading || uploading}>
                Batal
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
