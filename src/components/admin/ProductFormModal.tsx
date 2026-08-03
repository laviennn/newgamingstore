"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProduct } from "@/app/admin/(authenticated)/products/actions";
import { useNotification } from "@/components/ui/notification";
import { Loader2, UploadCloud } from "lucide-react";
import { uploadFile } from "@/app/actions/upload";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProductFormModal({ isOpen, onClose, product, games }: { isOpen: boolean; onClose: () => void; product?: any; games: any[] }) {
  const { showNotification } = useNotification();
  const [loading, setLoading] = React.useState(false);
  const [isFlashSale, setIsFlashSale] = React.useState(product?.is_flash_sale || false);
  const [imageUrl, setImageUrl] = React.useState(product?.image_url || "");
  const [uploadingImage, setUploadingImage] = React.useState(false);

  React.useEffect(() => {
    setIsFlashSale(product?.is_flash_sale || false);
    setImageUrl(product?.image_url || "");
  }, [product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadFile(formData);
    
    if (result.error) {
      showNotification("error", "Upload Failed", result.error);
    } else if (result.url) {
      setImageUrl(result.url);
      showNotification("success", "Upload Success", "Image uploaded successfully.");
    }
    setUploadingImage(false);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("image_url", imageUrl); // Manually append the image URL

    const result = await saveProduct(formData, product?.id);
    
    setLoading(false);
    
    if (result.error) {
      showNotification("error", "Error", result.error);
    } else {
      showNotification("success", "Success", `Product successfully ${product ? 'updated' : 'added'}!`);
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="game_id" className="text-sm font-medium">Select Game</label>
            <select 
              id="game_id" 
              name="game_id" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue={product?.game_id || ""}
              required
            >
              <option value="" disabled>Select a game...</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Product Name (e.g., 86 Diamonds)</label>
            <Input 
              id="name" 
              name="name" 
              placeholder="e.g., 86 Diamonds" 
              defaultValue={product?.name || ""}
              required 
            />
          </div>

          {/* Product Icon / Image Upload */}
          <div className="space-y-2 border border-border/50 rounded-lg p-3 bg-muted/20">
            <label className="text-sm font-medium">Product Icon</label>
            <div className="flex items-center gap-4">
               {imageUrl && (
                 <div className="relative w-12 h-12 rounded bg-background border border-border shrink-0 overflow-hidden">
                    <Image src={imageUrl} alt="Icon Preview" fill sizes="48px" className="object-cover" />
                 </div>
               )}
               <div className="flex-1 space-y-2">
                 <Input 
                    type="url" 
                    placeholder="https://..." 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    className="h-8 text-xs" 
                 />
                 <label className="flex items-center justify-center w-full h-8 px-3 py-1 text-xs font-semibold rounded-md border border-input bg-background hover:bg-muted cursor-pointer transition-colors">
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 mr-2" />}
                    {uploadingImage ? "Uploading..." : "Upload from Computer"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                 </label>
               </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">Price (Rp)</label>
            <Input 
              id="price" 
              name="price" 
              type="number"
              min="0"
              placeholder="e.g., 24000" 
              defaultValue={product?.price || ""}
              required 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="active" className="text-sm font-medium">Status</label>
            <select 
              id="active" 
              name="active" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue={product ? (product.active ? "true" : "false") : "true"}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="space-y-2 border-t border-border/40 pt-4 mt-4">
            <h4 className="font-semibold text-sm">Flash Sale Settings</h4>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="is_flash_sale" className="text-sm font-medium">Is Flash Sale?</label>
            <select 
              id="is_flash_sale" 
              name="is_flash_sale" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={isFlashSale ? "true" : "false"}
              onChange={(e) => setIsFlashSale(e.target.value === "true")}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          {isFlashSale && (
            <>
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label htmlFor="original_price" className="text-sm font-medium">Original Price (Rp)</label>
                <Input 
                  id="original_price" 
                  name="original_price" 
                  type="number"
                  min="0"
                  placeholder="e.g., 55000" 
                  defaultValue={product?.original_price || ""}
                  required={isFlashSale}
                />
                <p className="text-xs text-muted-foreground">The price before discount (strikethrough).</p>
              </div>

              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label htmlFor="flash_sale_stock" className="text-sm font-medium">Flash Sale Stock</label>
                <Input 
                  id="flash_sale_stock" 
                  name="flash_sale_stock" 
                  type="number"
                  min="0"
                  placeholder="e.g., 18" 
                  defaultValue={product?.flash_sale_stock || ""}
                  required={isFlashSale}
                />
                <p className="text-xs text-muted-foreground">Remaining quota for the promo.</p>
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
