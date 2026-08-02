"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveGame } from "@/app/admin/games/actions";
import { uploadFile } from "@/app/actions/upload";
import { useNotification } from "@/components/ui/notification";
import { Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GameFormModal({ isOpen, onClose, game, categories = [] }: { isOpen: boolean; onClose: () => void; game?: any, categories?: any[] }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [loading, setLoading] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(game?.image_url || null);
  const [bgPreview, setBgPreview] = React.useState<string | null>(game?.background_image || null);
  const [guidePreview, setGuidePreview] = React.useState<string | null>(game?.guide_image_url || null);
  const [categoryId, setCategoryId] = React.useState<string>(game?.category_id || "");
  const [formFieldsJson, setFormFieldsJson] = React.useState(
    game?.form_fields ? JSON.stringify(game.form_fields, null, 2) : "[\n  {\n    \"name\": \"userId\",\n    \"type\": \"text\",\n    \"label\": \"User ID\",\n    \"required\": true\n  }\n]"
  );
  const [isPopular, setIsPopular] = React.useState<boolean>(game?.is_popular || false);

  React.useEffect(() => {
    setTimeout(() => {
      setImagePreview(game?.image_url || null);
      setBgPreview(game?.background_image || null);
      setGuidePreview(game?.guide_image_url || null);
      setCategoryId(game?.category_id || "");
      setIsPopular(game?.is_popular || false);
      if (game) {
        setFormFieldsJson(game.form_fields ? JSON.stringify(game.form_fields, null, 2) : "[]");
      } else {
        setFormFieldsJson("[\n  {\n    \"name\": \"userId\",\n    \"type\": \"text\",\n    \"label\": \"User ID\",\n    \"required\": true\n  }\n]");
      }
    }, 0);
  }, [game]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBgPreview(URL.createObjectURL(file));
  };
  
  const handleGuideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setGuidePreview(URL.createObjectURL(file));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Handle Main Image
    const file = formData.get("image_file") as File;
    let finalImageUrl = formData.get("image_url_input") as string || game?.image_url || "";

    if (file && file.size > 0) {
       const uploadFormData = new FormData();
       uploadFormData.append("file", file);
       const uploadResult = await uploadFile(uploadFormData);
       if (uploadResult.error) {
         showNotification("error", "Icon Upload Failed", uploadResult.error);
         setLoading(false);
         return;
       }
       if (uploadResult.url) finalImageUrl = uploadResult.url;
    }
    
    // Handle Background Image
    const bgFile = formData.get("background_image_file") as File;
    let finalBgUrl = formData.get("background_image_url") as string || game?.background_image || "";

    if (bgFile && bgFile.size > 0) {
       const uploadBgData = new FormData();
       uploadBgData.append("file", bgFile);
       const uploadBgResult = await uploadFile(uploadBgData);
       if (uploadBgResult.error) {
         showNotification("error", "Background Upload Failed", uploadBgResult.error);
         setLoading(false);
         return;
       }
       if (uploadBgResult.url) finalBgUrl = uploadBgResult.url;
    }
    // Handle Guide Image
    const guideFile = formData.get("guide_image_file") as File;
    let finalGuideUrl = formData.get("guide_image_url") as string || game?.guide_image_url || "";

    if (guideFile && guideFile.size > 0) {
       const uploadGuideData = new FormData();
       uploadGuideData.append("file", guideFile);
       const uploadGuideResult = await uploadFile(uploadGuideData);
       if (uploadGuideResult.error) {
         showNotification("error", "Guide Image Upload Failed", uploadGuideResult.error);
         setLoading(false);
         return;
       }
       if (uploadGuideResult.url) finalGuideUrl = uploadGuideResult.url;
    }
    
    const payload = new FormData();
    payload.append("name", formData.get("name") as string);
    payload.append("slug", formData.get("slug") as string);
    payload.append("developer", formData.get("developer") as string);
    payload.append("image_url", finalImageUrl);
    payload.append("background_image", finalBgUrl);
    payload.append("category_id", categoryId);
    payload.append("form_fields", formFieldsJson);
    payload.append("is_popular", isPopular ? "true" : "false");
    
    payload.append("topup_instructions", formData.get("topup_instructions") as string);
    payload.append("guide_image_url", finalGuideUrl);
    payload.append("guide_text", formData.get("guide_text") as string);

    const result = await saveGame(payload, game?.id);
    
    setLoading(false);
    
    if (result.error) {
      showNotification("error", "Error", result.error);
    } else {
      showNotification("success", "Success", `Game successfully ${game ? 'updated' : 'added'}!`);
      onClose();
    }
  }

  return (
    <>
      {NotificationComponent}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{game ? "Edit Game" : "Add New Game"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Game Name</label>
              <Input id="name" name="name" placeholder="Mobile Legends" defaultValue={game?.name || ""} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">Slug</label>
              <Input id="slug" name="slug" placeholder="mobile-legends" defaultValue={game?.slug || ""} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="developer" className="text-sm font-medium">Developer</label>
              <Input id="developer" name="developer" placeholder="Moonton" defaultValue={game?.developer || ""} />
            </div>
            <div className="space-y-2">
              <label htmlFor="category_id" className="text-sm font-medium">Category</label>
              <select 
                id="category_id" name="category_id" 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Uncategorized --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2 border-t pt-4">
            <label className="text-sm font-medium">Game Icon (Logo)</label>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground">Image URL (Optional if uploading)</label>
                <Input 
                  id="image_url_input" name="image_url_input" 
                  placeholder="https://assets.newgamingstore.com/..." 
                  defaultValue={game?.image_url || ""}
                  onChange={(e) => setImagePreview(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground">Or Upload File</label>
                <label className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted/50">
                   <UploadCloud className="mr-2 h-4 w-4" /> <span>Upload to R2</span>
                   <input type="file" name="image_file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>
            {imagePreview && (
               <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border bg-black/20">
                 <Image src={imagePreview} alt="Icon Preview" fill sizes="80px" className="object-cover" />
               </div>
            )}
          </div>

          <div className="space-y-2 border-t pt-4">
            <label className="text-sm font-medium">Background Banner (For Popular Games Section)</label>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground">Image URL</label>
                <Input 
                  id="background_image_url" name="background_image_url" 
                  placeholder="https://assets.newgamingstore.com/..." 
                  defaultValue={game?.background_image || ""}
                  onChange={(e) => setBgPreview(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground">Or Upload File</label>
                <label className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted/50">
                   <UploadCloud className="mr-2 h-4 w-4" /> <span>Upload to R2</span>
                   <input type="file" name="background_image_file" accept="image/*" className="hidden" onChange={handleBgChange} />
                </label>
              </div>
            </div>
            {bgPreview && (
               <div className="mt-2 relative w-full h-24 rounded-lg overflow-hidden border bg-black/20">
                 <Image src={bgPreview} alt="BG Preview" fill sizes="400px" className="object-cover" />
               </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <label className="text-sm font-medium">Popular Game Status</label>
              <p className="text-xs text-muted-foreground">Tampilkan game ini di section "POPULER!" pada halaman utama Storefront</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isPopular} 
                onChange={(e) => setIsPopular(e.target.checked)} 
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="space-y-2 border-t pt-4">
            <label htmlFor="topup_instructions" className="text-sm font-medium">Top Up Instructions (Game Detail Page)</label>
            <p className="text-xs text-muted-foreground">Deskripsi dan cara melakukan transaksi</p>
            <Textarea 
              id="topup_instructions" name="topup_instructions" 
              defaultValue={game?.topup_instructions || ""}
              placeholder="1) Pilih Nominal&#10;2) Masukkan Data Akun..."
              rows={5}
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <label className="text-sm font-medium">Guide Modal (Panduan Pengisian)</label>
            <p className="text-xs text-muted-foreground">Gambar dan teks untuk panduan letak UID di dalam game</p>
            <div className="flex gap-4 items-end mt-2">
              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground">Guide Image URL</label>
                <Input 
                  id="guide_image_url" name="guide_image_url" 
                  placeholder="https://assets.newgamingstore.com/..." 
                  defaultValue={game?.guide_image_url || ""}
                  onChange={(e) => setGuidePreview(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground">Or Upload File</label>
                <label className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted/50">
                   <UploadCloud className="mr-2 h-4 w-4" /> <span>Upload Guide Image</span>
                   <input type="file" name="guide_image_file" accept="image/*" className="hidden" onChange={handleGuideChange} />
                </label>
              </div>
            </div>
            {guidePreview && (
               <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border bg-black/20">
                 <Image src={guidePreview} alt="Guide Preview" fill sizes="400px" className="object-contain" />
               </div>
            )}
            <div className="space-y-2 mt-2">
              <label htmlFor="guide_text" className="text-xs text-muted-foreground">Guide Text</label>
              <Input 
                id="guide_text" name="guide_text" 
                placeholder="Contoh : UID = 123456789, Server = Asia" 
                defaultValue={game?.guide_text || ""}
              />
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <label htmlFor="form_fields" className="text-sm font-medium">Form Fields (JSON array)</label>
            <Textarea 
              id="form_fields" name="form_fields" 
              value={formFieldsJson} onChange={(e) => setFormFieldsJson(e.target.value)}
              rows={6} className="font-mono text-xs"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving..." : "Save Game"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
