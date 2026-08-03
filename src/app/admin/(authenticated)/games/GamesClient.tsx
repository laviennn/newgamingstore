"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { deleteGame, toggleGamePopular } from "@/app/admin/(authenticated)/games/actions";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { useNotification } from "@/components/ui/notification";
import { Trash2, Edit, Star } from "lucide-react";
import { GameFormModal } from "@/components/admin/GameFormModal";

import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GamesClient({ initialGames, categories = [] }: { initialGames: any[], categories?: any[] }) {
  const { showNotification, NotificationComponent } = useNotification();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedGame, setSelectedGame] = React.useState<any>(null);

  const handleTogglePopular = async (id: string, currentPopular: boolean) => {
    const res = await toggleGamePopular(id, !currentPopular);
    if (res.error) {
      showNotification("error", "Failed", res.error);
    } else {
      showNotification("success", "Updated", "Popular status updated.");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (game: any) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedGame(null);
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
    const result = await deleteGame(deleteState.id);
    if (result.error) {
      showNotification("error", "Failed to Delete", result.error);
      setDeleteState(prev => ({ ...prev, loading: false }));
    } else {
      showNotification("success", "Deleted", "Game has been removed successfully.");
      setDeleteState({ isOpen: false, id: "", name: "", loading: false });
    }
  };

  return (
    <>
      {NotificationComponent}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Games Catalog</h1>
        <Button onClick={handleAdd}>Add Game</Button>
      </div>

      <div className="relative w-full overflow-auto bg-card rounded-xl border shadow-sm">
        <table className="w-full caption-bottom text-sm text-left">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 font-medium w-16">Image</th>
              <th className="h-12 px-4 font-medium">Game Name</th>
              <th className="h-12 px-4 font-medium">Category</th>
              <th className="h-12 px-4 font-medium">Slug</th>
              <th className="h-12 px-4 font-medium">Populer</th>
              <th className="h-12 px-4 font-medium">Fields</th>
              <th className="h-12 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {initialGames.map((g) => (
              <tr key={g.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4">
                  <div className="relative w-12 h-12 rounded-lg bg-muted border overflow-hidden flex items-center justify-center">
                    {g.image_url ? (
                       <Image src={g.image_url} alt={g.name} fill sizes="48px" className="object-cover" />
                    ) : (
                       <span className="text-[10px] text-muted-foreground">No Img</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium">{g.name}</td>
                <td className="p-4 text-xs text-muted-foreground">{g.categories?.name || '-'}</td>
                <td className="p-4 font-mono text-xs">{g.slug}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleTogglePopular(g.id, !!g.is_popular)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                      g.is_popular 
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Star className={`w-3 h-3 ${g.is_popular ? "fill-amber-500" : ""}`} />
                    {g.is_popular ? "Populer" : "Biasa"}
                  </button>
                </td>
                <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                      {Array.isArray(g.form_fields) ? g.form_fields.length : 0} fields
                    </span>
                </td>
                <td className="p-4 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(g)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDeleteClick(g.id, g.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </td>
              </tr>
            ))}
            {initialGames.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No games found. Add your first game!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <GameFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        game={selectedGame} 
        categories={categories}
      />

      <ConfirmDeleteDialog 
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Hapus Game"
        description="Are you sure you want to delete this game? This might break existing products."
        itemName={deleteState.name}
        loading={deleteState.loading}
      />
    </>
  );
}
