"use client";

import React, { useState } from "react";
import { Menu, X, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { AdminSidebarNav } from "./AdminSidebarNav";

interface AdminMobileNavProps {
  isSuperAdmin: boolean;
  permissions: string[];
}

export function AdminMobileNav({ isSuperAdmin, permissions }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden flex items-center justify-center p-2 rounded-lg hover:bg-muted/80 transition-colors"
        aria-label="Buka Menu Navigasi"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs sm:hidden animate-in fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-background border-r shadow-2xl flex flex-col sm:hidden transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 font-semibold"
          >
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="font-bold">Admin Dashboard</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4" onClick={(e) => {
          // Close drawer on link click
          if ((e.target as HTMLElement).closest("a")) {
            setOpen(false);
          }
        }}>
          <AdminSidebarNav isSuperAdmin={isSuperAdmin} permissions={permissions} />
        </div>
      </div>
    </>
  );
}
