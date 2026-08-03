"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Search, List, Trophy, MessageCircle, LogOut } from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

interface MobileSidebarProps {
  user?: User | null;
  waChannelActive?: boolean;
  waChannelUrl?: string;
}

export function MobileSidebar({ user, waChannelActive, waChannelUrl }: MobileSidebarProps) {
  const [isPending, startTransition] = useTransition();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (!user?.email) return;
    const supabase = createClient();
    async function fetchBalance() {
      const { data } = await supabase
        .from("wallets")
        .select("balance")
        .eq("email", user!.email!.toLowerCase())
        .maybeSingle();
      if (data && typeof data.balance === "number") {
        setBalance(data.balance);
      }
    }
    fetchBalance();
  }, [user]);

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  const name = user?.user_metadata?.name || "User";
  const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <Sheet>
      <SheetTrigger className="md:hidden w-10 h-10 text-white rounded-full bg-white/5 hover:bg-white/10 inline-flex items-center justify-center transition-colors">
        <Menu className="w-5 h-5" />
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-background border-border p-0 flex flex-col h-full">
        <SheetHeader className="p-4 border-b border-border/50 text-left">
          <SheetTitle className="text-lg font-bold">Menu Utama</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Auth Section or User Profile */}
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border/50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-900 font-bold flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="mt-1 inline-flex items-center gap-1 bg-black/50 border border-white/10 px-2.5 py-0.5 rounded-full text-xs font-bold text-blue-400">
                    <span className="text-gray-400 font-medium">Saldo:</span> Rp {balance.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              <Button onClick={handleLogout} disabled={isPending} variant="outline" className="w-full justify-center gap-2 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400">
                <LogOut className="w-4 h-4" />
                {isPending ? "Keluar..." : "Keluar Akun"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full justify-center rounded-xl font-bold bg-muted/50 border-border/50">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button className="w-full justify-center rounded-xl font-bold text-black bg-white hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    Daftar
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Banner WA */}
          {waChannelActive && waChannelUrl && (
            <Link href={waChannelUrl} target="_blank" rel="noopener noreferrer">
              <div className="w-full bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/30">
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Join Saluran WA</p>
                  <p className="text-xs text-muted-foreground">Info & Promo Spesial</p>
                </div>
              </div>
            </Link>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-5 h-5" />
              Beranda
            </Link>
            <Link href="/track" className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-5 h-5" />
              Cek Transaksi
            </Link>
            <Link href="/prices" className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <List className="w-5 h-5" />
              Daftar Harga
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <Trophy className="w-5 h-5" />
              Leaderboard
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="w-5 h-5" />
              Menu Lainnya
            </Link>
          </nav>
        </div>
        
        <div className="p-4 text-center border-t border-border/50">
          <p className="text-xs text-muted-foreground">&copy; 2026 {process.env.NEXT_PUBLIC_APP_NAME || "Gaming Store"}. All rights reserved.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
