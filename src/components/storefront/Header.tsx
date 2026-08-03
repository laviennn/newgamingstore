"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MobileSidebar } from "@/components/storefront/MobileSidebar";
import { GlobalSearch } from "@/components/storefront/GlobalSearch";

import { UserDropdown } from "@/components/storefront/UserDropdown";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  logoUrl?: string | null;
  domain: string;
  user?: User | null;
}

export function Header({ logoUrl, domain, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8 gap-4 md:gap-8">
        {/* Logo */}
        <Link className="flex items-center space-x-2 shrink-0" href="/">
          {logoUrl ? (
            <div className="relative h-10 w-40 md:h-12 md:w-48">
              <Image src={logoUrl} alt={`${domain} Logo`} fill sizes="(max-width: 768px) 160px, 192px" className="object-contain object-left" />
            </div>
          ) : (
            <span className="font-extrabold text-xl tracking-tight sm:inline-block capitalize bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">{domain}</span>
          )}
        </Link>
        
        {/* Main Navigation - Desktop */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="text-foreground/80 hover:text-foreground transition-colors">Beranda</Link>
          <Link href="/track" className="text-foreground/80 hover:text-foreground transition-colors">Cek Transaksi</Link>
          <Link href="/prices" className="text-foreground/80 hover:text-foreground transition-colors">Daftar Harga</Link>
          <Link href="/blog" className="text-foreground/80 hover:text-foreground transition-colors">Blog</Link>
        </nav>
        
        <div className="flex-1" />

        {/* Search Bar - Desktop handled inside GlobalSearch */}
        <div className="hidden md:block relative max-w-sm w-full">
           <GlobalSearch />
        </div>

        {/* Auth Buttons / User Dropdown - Desktop Only */}
        <div className="hidden md:flex items-center justify-end space-x-1 md:space-x-3 shrink-0">
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="font-semibold px-2 md:px-4 text-xs md:text-sm hover:bg-white/10 hover:text-white transition-colors">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white text-black hover:bg-gray-200 font-bold px-3 py-1 h-8 md:h-10 md:px-6 text-xs md:text-sm rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">Daftar</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Right Icons (Search & Sidebar) */}
        <div className="flex md:hidden items-center gap-2">
          <div className="block md:hidden">
             <GlobalSearch />
          </div>
          {user && (
            <UserDropdown user={user} />
          )}
          <MobileSidebar user={user} />
        </div>
      </div>
    </header>
  );
}
