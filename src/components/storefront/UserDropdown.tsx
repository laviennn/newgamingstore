"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { 
  LayoutGrid, 
  Wallet, 
  History, 
  ListOrdered, 
  Crown, 
  Settings, 
  LogOut, 
  Mail, 
  Phone,
  BadgeCheck
} from "lucide-react";
import { logout } from "@/app/actions/auth";

import { createClient } from "@/utils/supabase/client";

interface UserDropdownProps {
  user: User;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [balance, setBalance] = useState<number>(0);

  const email = user.email || "";

  // Fetch real balance from wallets table
  useEffect(() => {
    if (!email) return;
    const supabase = createClient();
    async function fetchBalance() {
      const { data } = await supabase
        .from("wallets")
        .select("balance")
        .eq("email", email.toLowerCase())
        .maybeSingle();
      if (data && typeof data.balance === "number") {
        setBalance(data.balance);
      }
    }
    fetchBalance();
  }, [email]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  const name = user.user_metadata?.name || "User";
  const phone = user.user_metadata?.phone || "-";
  
  // Get 2 Initials
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition-colors relative"
      >
        {initials}
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black"></div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[320px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Info */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 tracking-wider">AKUN ANDA</span>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-xs text-gray-300">Member</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-white">{name}</h3>
              <BadgeCheck className="w-5 h-5 text-blue-500" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{phone}</span>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-white/10 my-2" />

          {/* Menu Items */}
          <div className="flex flex-col px-3 space-y-1">
            <Link 
              href="/member/dashboard" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <LayoutGrid className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Dashboard Member</span>
            </Link>

            <Link 
              href="/member/deposit" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <Wallet className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Saldo Akun</span>
              </div>
              <div className="bg-black/50 border border-white/10 px-2.5 py-1 rounded-full text-xs font-bold">
                <span className="text-gray-500 mr-1">Rp</span> {balance.toLocaleString('id-ID')}
              </div>
            </Link>

            <Link 
              href="/member/transactions" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <History className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Riwayat Transaksi</span>
            </Link>

            <Link 
              href="/member/deposits" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <ListOrdered className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Riwayat Deposit</span>
            </Link>

            <Link 
              href="/member/upgrade" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-4">
                <Crown className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                <span className="font-medium">Upgrade Membership</span>
              </div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
            </Link>

            <Link 
              href="/member/profile" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Pengaturan Profile</span>
            </Link>
          </div>

          <div className="h-[1px] bg-white/10 my-2" />

          {/* Logout */}
          <div className="px-3 pb-2">
            <button 
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center gap-4 px-3 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{isPending ? "Keluar..." : "Keluar"}</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
