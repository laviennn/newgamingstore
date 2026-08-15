"use client";

import { SkeuoStatusBadge } from "@/components/ui/skeuo-switch";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { deleteProduct, duplicateProduct, toggleProductStatus } from "@/app/admin/(authenticated)/products/actions";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { useNotification } from "@/components/ui/notification";
import { Trash2, Edit, Copy } from "lucide-react";
import { ProductFormModal } from "@/components/admin/ProductFormModal";

import Image from "next/image";
import { Currency, formatCurrency } from "@/lib/currencyUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProductsClient({ initialProducts, games, currency = 'IDR' }: { initialProducts: any[], games: any[], currency?: Currency }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const [deleteState, setDeleteState] = React.useState<{ isOpen: boolean; id: string; name: string; loading: boolean }>({
    isOpen: false,
    id: "",
    name: "",
    loading: false,
  });

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteState({ isOpen: true, id, name, loading: false });
  };

  const confirmDelete = async () => {
    setDeleteState(prev => ({ ...prev, loading: true }));
    const result = await deleteProduct(deleteState.id);
    if (result.error) {
      showNotification("error", "Gagal Menghapus", result.error);
      setDeleteState(prev => ({ ...prev, loading: false }));
    } else {
      showNotification("success", "Berhasil Dihapus", `Produk "${deleteState.name}" telah berhasil dihapus.`);
      setDeleteState({ isOpen: false, id: "", name: "", loading: false });
    }
  };

  const handleDuplicate = async (id: string) => {
    const result = await duplicateProduct(id);
    if (result.error) {
      showNotification("error", "Gagal Menduplikasi", result.error);
    } else {
      showNotification("success", "Berhasil Diduplikasi", "Produk telah berhasil diduplikasi.");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    const nextStatus = !currentStatus;
    const result = await toggleProductStatus(id, nextStatus);
    if (result.error) {
      showNotification("error", "Gagal Mengubah Status", result.error);
    } else {
      showNotification(
        "success",
        "Status Diperbarui",
        `Produk "${name}" sekarang ${nextStatus ? "Aktif" : "Nonaktif"}.`
      );
    }
  };

  return (
    <>
      {NotificationComponent}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Products & Prices</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
              currency === 'MYR' 
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
            }`}>
              <span className="text-sm leading-none">{currency === 'MYR' ? '🇲🇾' : '🇮🇩'}</span>
              <span>{currency === 'MYR' ? 'MYR (RM)' : 'IDR (Rp)'}</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola katalog produk, harga nominal ({currency === 'MYR' ? 'Ringgit Malaysia - RM' : 'Rupiah Indonesia - Rp'}), dan status aktif.
          </p>
        </div>
        <Button onClick={handleAdd}>Add Product</Button>
      </div>

      <div className="relative w-full overflow-auto bg-card rounded-xl border shadow-sm">
        <table className="w-full caption-bottom text-sm text-left">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 font-medium w-16">Game</th>
              <th className="h-12 px-4 font-medium">Product Name</th>
              <th className="h-12 px-4 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Price</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                    {currency === 'MYR' ? '🇲🇾 RM' : '🇮🇩 Rp'}
                  </span>
                </div>
              </th>
              <th className="h-12 px-4 font-medium">Status</th>
              <th className="h-12 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {initialProducts.map((p) => (
              <tr key={p.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4">
                  <div className="relative w-10 h-10 rounded-md bg-muted border overflow-hidden flex items-center justify-center">
                    {p.games?.image_url ? (
                       <Image src={p.games.image_url} alt={p.games.name} fill sizes="40px" className="object-cover" />
                    ) : (
                       <span className="text-[9px] text-muted-foreground text-center">{p.games?.name?.substring(0, 3)}</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium">
                  {p.name}
                  {p.is_flash_sale && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-500 ring-1 ring-inset ring-yellow-500/30">
                      ⚡ FLASH
                    </span>
                  )}
                </td>
                <td className="p-4 font-mono">
                  <div className="flex flex-col">
                    <span>{formatCurrency(Number(p.price), currency)}</span>
                    {p.is_flash_sale && p.original_price && (
                      <span className="text-xs text-muted-foreground line-through">{formatCurrency(Number(p.original_price), currency)}</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <SkeuoStatusBadge
                    checked={p.active ?? true}
                    onToggle={() => handleToggleStatus(p.id, p.active ?? true, p.name)}
                    activeText="Active"
                    inactiveText="Inactive"
                  />
                </td>
                <td className="p-4 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(p)}>
                       <Edit className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Edit</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(p.id)}>
                       <Copy className="h-4 w-4 mr-1" /> Duplicate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDeleteClick(p.id, p.name)}
                    >
                       <Trash2 className="h-4 w-4" />
                    </Button>
                </td>
              </tr>
            ))}
            {initialProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No products found. Add your first product!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
        games={games}
        currency={currency}
      />

      <ConfirmDeleteDialog 
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Hapus Produk"
        description="Are you sure you want to delete this product?"
        itemName={deleteState.name}
        loading={deleteState.loading}
      />
    </>
  );
}
