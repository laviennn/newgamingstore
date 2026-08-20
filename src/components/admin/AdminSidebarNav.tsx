"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  ShoppingCart,
  FileText,
  Settings,
  Layers,
  BookOpen,
  HelpCircle,
  Contact,
  CreditCard,
  Palette,
  Tag,
  ChevronDown,
  Folder,
  Globe,
  Shield,
  Crown,
  UserCheck,
  Activity,
  History,
} from "lucide-react";

interface AdminSidebarNavProps {
  isSuperAdmin: boolean;
  permissions: string[];
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  perm?: string;
  superAdminOnly?: boolean;
}

interface NavGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

export function AdminSidebarNav({ isSuperAdmin, permissions }: AdminSidebarNavProps) {
  const pathname = usePathname() || "/";

  const hasPerm = (perm?: string, superAdminOnly?: boolean) => {
    if (isSuperAdmin) return true;
    if (superAdminOnly) return false;
    if (!perm) return true;
    return permissions.includes(perm);
  };

  const isActive = (href: string) => {
    // Normalisasi pathname jika diakses dari /admin/... atau langsung dari domain admin
    const currentNormalized = pathname.replace(/^\/admin/, "") || "/";
    const targetNormalized = href.replace(/^\/admin/, "") || "/";

    if (targetNormalized === "/") {
      return currentNormalized === "/";
    }
    return (
      currentNormalized === targetNormalized ||
      currentNormalized.startsWith(`${targetNormalized}/`)
    );
  };

  const groups: NavGroup[] = useMemo(
    () => [
      {
        name: "Katalog & Layanan",
        icon: Folder,
        items: [
          { name: "Games", href: "/games", icon: Gamepad2, perm: "manage_games" },
          { name: "Categories", href: "/categories", icon: Layers, perm: "manage_categories" },
          { name: "Products", href: "/products", icon: ShoppingCart, perm: "manage_products" },
        ],
      },
      {
        name: "Transaksi & Promo",
        icon: CreditCard,
        items: [
          { name: "Orders", href: "/orders", icon: FileText, perm: "manage_orders" },
          { name: "Deposits", href: "/deposits", icon: CreditCard, perm: "manage_deposits" },
          { name: "Payments", href: "/payments", icon: CreditCard, perm: "manage_payments" },
          { name: "Promos", href: "/promos", icon: Tag, perm: "manage_promos" },
          { name: "Paket Membership", href: "/memberships", icon: Crown, perm: "manage_memberships" },
          { name: "Members", href: "/members", icon: UserCheck, perm: "manage_members" },
        ],
      },
      {
        name: "Konten & Informasi",
        icon: Globe,
        items: [
          { name: "Articles", href: "/articles", icon: BookOpen, perm: "manage_articles" },
          { name: "FAQ", href: "/faqs", icon: HelpCircle, perm: "manage_faqs" },
          { name: "Contacts & Footer", href: "/contacts", icon: Contact, perm: "manage_contacts" },
        ],
      },
      {
        name: "Pengaturan Sistem",
        icon: Shield,
        items: [
          { name: "Tenants", href: "/tenants", icon: Users, superAdminOnly: true },
          { name: "Content & Settings", href: "/content", icon: Settings, perm: "manage_content" },
          { name: "Theme & Branding", href: "/theme", icon: Palette, perm: "manage_theme" },
          { name: "API Logs & Kuota", href: "/api-logs", icon: Activity, superAdminOnly: true },
          { name: "Roles & Permissions", href: "/roles", icon: Shield, perm: "manage_roles" },
          { name: "Operators", href: "/operators", icon: UserCheck, perm: "manage_operators" },
          { name: "Activity Logs", href: "/activity-logs", icon: History, perm: "manage_activity_logs" },
        ],
      },
    ],
    []
  );

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
      {/* Single Dashboard Link */}
      <Link
        href="/"
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-sm ${
          isActive("/")
            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        }`}
      >
        <LayoutDashboard className={`h-4 w-4 shrink-0 ${isActive("/") ? "text-primary-foreground" : "text-muted-foreground"}`} />
        <span>Dashboard</span>
      </Link>

      {/* Accordion Groups */}
      {groups.map((group) => {
        const visibleItems = group.items.filter((item) => hasPerm(item.perm, item.superAdminOnly));
        if (visibleItems.length === 0) return null;

        const isGroupActive = visibleItems.some((item) => isActive(item.href));
        const GroupIcon = group.icon;

        return (
          <details
            key={group.name}
            className="group [&_summary::-webkit-details-marker]:hidden pt-1.5"
            open={isGroupActive}
          >
            <summary
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-all cursor-pointer list-none ${
                isGroupActive
                  ? "text-foreground font-semibold bg-muted/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <GroupIcon className={`h-4 w-4 shrink-0 ${isGroupActive ? "text-primary" : "text-muted-foreground"}`} />
                <span>{group.name}</span>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-border/60 pl-2">
              {visibleItems.map((item) => {
                const active = isActive(item.href);
                const ItemIcon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all relative ${
                      active
                        ? "bg-primary/10 text-primary font-semibold dark:bg-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {active && (
                      <span className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-1.5 h-5 bg-primary rounded-full shadow-xs" />
                    )}
                    <ItemIcon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </details>
        );
      })}
    </nav>
  );
}
