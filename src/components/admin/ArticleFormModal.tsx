"use client";

import { SkeuoToggle } from "@/components/ui/skeuo-switch";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveArticle } from "@/app/admin/(authenticated)/articles/actions";
import { uploadFile } from "@/app/actions/upload";
import { compressImageClient } from "@/lib/client-image-compressor";
import { useNotification } from "@/components/ui/notification";
import { Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ArticleFormModal({ isOpen, onClose, article }: { isOpen: boolean; onClose: () => void; article?: any }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [loading, setLoading] = React.useState(false);

  const [title, setTitle] = React.useState(article?.title || "");
  const [slug, setSlug] = React.useState(article?.slug || "");
  const [author, setAuthor] = React.useState(article?.author || "Admin");
  const [content, setContent] = React.useState(article?.content || "");
  const [imagePreview, setImagePreview] = React.useState<string | null>(article?.image_url || null);
  const [isPublished, setIsPublished] = React.useState(article?.is_published ?? true);

  React.useEffect(() => {
    setTitle(article?.title || "");
    setSlug(article?.slug || "");
    setAuthor(article?.author || "Admin");
    setContent(article?.content || "");
    setImagePreview(article?.image_url || null);
    setIsPublished(article?.is_published ?? true);
  }, [article, isOpen]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!article) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Handle Image Upload to R2 with Auto-Compression (Preset: banner)
    const file = formData.get("image_file") as File;
    let finalImageUrl = formData.get("image_url_input") as string || article?.image_url || "";

    if (file && file.size > 0) {
       const compressed = await compressImageClient(file, "banner");
       const uploadFormData = new FormData();
       uploadFormData.append("file", compressed.file);
       const uploadResult = await uploadFile(uploadFormData);
       if (uploadResult.error) {
         showNotification("error", "Upload Gagal", uploadResult.error);
         setLoading(false);
         return;
       }
       if (uploadResult.url) finalImageUrl = uploadResult.url;
    }
    
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("author", author);
    formData.set("content", content);
    formData.set("is_published", isPublished.toString());
    
    formData.set("image_url", finalImageUrl);
    formData.delete("image_file");
    formData.delete("image_url_input");

    const result = await saveArticle(formData, article?.id);
    
    setLoading(false);
    
    if (result.error) {
      showNotification("error", "Error", result.error);
    } else {
      showNotification("success", "Berhasil", `Artikel berhasil ${article ? 'diperbarui' : 'ditambahkan'}!`);
      onClose();
    }
  }

  return (
    <>
      {NotificationComponent}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{article ? "Edit Artikel" : "Tambah Artikel Baru"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Judul Artikel</label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Cara Top Up Mudah..."
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium">Slug (URL)</label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="cara-top-up-mudah"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="author" className="text-sm font-medium">Penulis / Sumber</label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Yowanastore"
              />
            </div>

            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-medium">Gambar Thumbnail (R2 Storage)</label>
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-xs text-muted-foreground">URL Gambar (Opsional jika upload)</label>
                  <Input 
                    id="image_url_input" name="image_url_input" 
                    placeholder="https://assets.newgamingstore.com/..." 
                    defaultValue={article?.image_url || ""}
                    onChange={(e) => setImagePreview(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs text-muted-foreground">Atau Upload File Lokal</label>
                  <label className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted/50">
                     <UploadCloud className="mr-2 h-4 w-4" /> <span>Upload to R2</span>
                     <input type="file" name="image_file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>
              {imagePreview && (
                 <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border bg-black/20">
                   <Image src={imagePreview} alt="Preview" fill sizes="400px" className="object-cover" />
                 </div>
              )}
            </div>

            <div className="space-y-2 border-t pt-4">
              <label htmlFor="content" className="text-sm font-medium">Isi Artikel (Mendukung HTML)</label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="<p>Ini adalah artikel pertama...</p>"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-medium block">Status Publikasi</label>
              <div>
                <SkeuoToggle
                  checked={isPublished}
                  onChange={(val) => setIsPublished(val)}
                  activeText="Publish"
                  inactiveText="Draft"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Menyimpan..." : "Simpan Artikel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
