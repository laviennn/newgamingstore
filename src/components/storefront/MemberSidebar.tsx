"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { 
  LayoutGrid, 
  Wallet, 
  History, 
  Receipt, 
  Crown, 
  LogOut 
} from "lucide-react";
import { logout } from "@/app/actions/auth";

export function MemberSidebar() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/member/dashboard",
      icon: LayoutGrid,
    },
    {
      name: "Deposit",
      href: "/member/deposit",
      icon: Wallet,
    },
    {
      name: "Riwayat Transaksi",
      href: "/member/transactions",
      icon: History,
    },
    {
      name: "Riwayat Deposit",
      href: "/member/deposits",
      icon: Receipt,
    },
    {
      name: "Upgrade Membership",
      href: "/member/upgrade",
      icon: Crown,
    },
  ];

  return (
    <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
      {/* Main Navigation Card */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/member/dashboard" && pathname.endsWith("/member"));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? "bg-white/10 text-white font-semibold shadow-inner border-l-2 border-theme-primary"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-theme-primary opacity-90" : "text-gray-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="w-full bg-[#e11d48] hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-start gap-3 shadow-lg shadow-rose-950/20 disabled:opacity-50"
      >
        <LogOut className="w-5 h-5" />
        <span>{isPending ? "Keluar..." : "Keluar"}</span>
      </button>
    </div>
  );
}
