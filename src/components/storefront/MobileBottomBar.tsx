"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Megaphone, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomBarProps {
  waChannelActive?: boolean;
  waChannelUrl?: string;
  isLoggedIn?: boolean;
}

export function MobileBottomBar({ waChannelActive, waChannelUrl, isLoggedIn = false }: MobileBottomBarProps) {
  const pathname = usePathname();

  const topUpHref = isLoggedIn ? "/member/deposit" : "/login";

  const navItems = [
    {
      label: "BERANDA",
      icon: Home,
      href: "/",
    },
    {
      label: "TOP UP",
      icon: Wallet,
      href: topUpHref,
    }
  ];

  if (waChannelActive && waChannelUrl) {
    navItems.push({
      label: "KOMUNITAS",
      icon: Megaphone,
      href: waChannelUrl,
    });
  } else {
    navItems.push({
      label: "DAFTAR HARGA",
      icon: Tag,
      href: "/prices",
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border/40 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/member/deposit" && pathname?.startsWith("/member"));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

