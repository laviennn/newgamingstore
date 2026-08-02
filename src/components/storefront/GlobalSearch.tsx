"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Gamepad2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { searchGames } from "@/app/actions/search";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Handle keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      const res = await searchGames(query);
      if (res.success) {
        setResults(res.games);
      } else {
        setResults([]);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setQuery("");
        setResults([]);
      }, 300);
    }
  }, [open]);

  return (
    <>
      <div 
        className="hidden md:flex relative max-w-sm w-full items-center group cursor-text"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <div className="pl-9 pr-14 bg-muted/50 border border-border/50 hover:border-border rounded-full h-10 w-full flex items-center text-sm text-muted-foreground transition-all">
          Cari game favoritmu...
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">CTRL</span>K
          </kbd>
        </div>
      </div>

      {/* Mobile Trigger */}
      <button 
        onClick={() => setOpen(true)}
        className="flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-[#0f0f0f] border-gray-800 gap-0 shadow-2xl">
          <div className="flex items-center border-b border-gray-800 px-4">
            <Search className="w-5 h-5 text-gray-500 shrink-0" />
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik nama game (Mobile Legends, Genshin...)"
              className="flex-1 bg-transparent border-none focus:ring-0 text-base md:text-lg px-4 py-4 md:py-6 text-white placeholder-gray-600 outline-none w-full"
              autoFocus
            />
            {loading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!query.trim() ? (
              <div className="p-8 text-center text-gray-500 space-y-3">
                <Gamepad2 className="w-12 h-12 mx-auto text-gray-700" />
                <p className="text-sm">Cari game favoritmu dan top-up sekarang!</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((game) => (
                  <Link 
                    key={game.id} 
                    href={`/game/${game.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden shrink-0 relative">
                      {game.image_url ? (
                        <img 
                          src={game.image_url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com')} 
                          alt={game.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                      ) : (
                        <Gamepad2 className="w-6 h-6 text-gray-500 m-auto mt-3" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-sm md:text-base group-hover:text-blue-400 transition-colors">{game.name}</h4>
                      <p className="text-xs text-gray-500">Top Up Instant</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : !loading ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">Game tidak ditemukan untuk pencarian &quot;{query}&quot;.</p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
