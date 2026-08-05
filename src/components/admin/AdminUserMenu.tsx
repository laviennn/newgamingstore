"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Shield, Crown, ChevronDown } from "lucide-react";
import { adminLogout } from "@/app/admin/actions";

interface AdminUserMenuProps {
  email: string;
  isSuperAdmin: boolean;
  roleName?: string;
}

export function AdminUserMenu({ email, isSuperAdmin, roleName }: AdminUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initial = email ? email.charAt(0).toUpperCase() : "A";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await adminLogout();
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        title={email}
      >
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm ring-2 ring-primary/20">
          {initial}
        </div>
        <div className="hidden md:flex flex-col items-start text-left text-xs mr-1">
          <span className="font-semibold text-foreground max-w-[120px] truncate">{email}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            {isSuperAdmin ? (
              <span className="text-amber-500 font-bold flex items-center gap-0.5">
                <Crown className="w-3 h-3 inline" /> SuperAdmin
              </span>
            ) : (
              <span className="text-emerald-500 font-medium truncate max-w-[100px]">
                {roleName || "Operator"}
              </span>
            )}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-border/60 shadow-2xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header Info */}
          <div className="p-3 border-b border-border/50 mb-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base border border-primary/20">
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-foreground truncate">{email}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isSuperAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Crown className="w-3 h-3" /> SuperAdmin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <Shield className="w-3 h-3" /> {roleName || "Operator"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{loading ? "Logging out..." : "Keluar (Logout)"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
