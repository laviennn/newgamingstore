"use client";

import { SkeuoToggle } from "@/components/ui/skeuo-switch";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveFaq } from "@/app/admin/faqs/actions";
import { useNotification } from "@/components/ui/notification";
import { Loader2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FaqFormModal({ isOpen, onClose, faq }: { isOpen: boolean; onClose: () => void; faq?: any }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [loading, setLoading] = React.useState(false);

  const [question, setQuestion] = React.useState(faq?.question || "");
  const [answer, setAnswer] = React.useState(faq?.answer || "");
  const [sortOrder, setSortOrder] = React.useState(faq?.sort_order || 0);
  const [isActive, setIsActive] = React.useState(faq?.is_active ?? true);

  React.useEffect(() => {
    setQuestion(faq?.question || "");
    setAnswer(faq?.answer || "");
    setSortOrder(faq?.sort_order || 0);
    setIsActive(faq?.is_active ?? true);
  }, [faq, isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("is_active", isActive.toString());

    const result = await saveFaq(formData, faq?.id);
    
    setLoading(false);
    
    if (result.error) {
      showNotification("error", "Error", result.error);
    } else {
      showNotification("success", "Berhasil", `FAQ berhasil ${faq ? 'diperbarui' : 'ditambahkan'}!`);
      onClose();
    }
  }

  return (
    <>
      {NotificationComponent}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{faq ? "Edit FAQ" : "Tambah FAQ Baru"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <label htmlFor="question" className="text-sm font-medium">Pertanyaan</label>
              <Input
                id="question"
                name="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Bagaimana cara top up?"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-medium">Jawaban</label>
              <Textarea
                id="answer"
                name="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
                placeholder="Tuliskan jawaban yang informatif..."
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="sort_order" className="text-sm font-medium">Urutan Tampil (Opsional)</label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium block">Status Tampil</label>
              <div>
                <SkeuoToggle
                  checked={isActive}
                  onChange={(val) => setIsActive(val)}
                  activeText="Aktif (Tampilkan)"
                  inactiveText="Nonaktif (Sembunyikan)"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Menyimpan..." : "Simpan FAQ"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
