"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  Layers,
  FileText,
  UserCheck,
  Shield,
  Clock,
  Sparkles,
  Smartphone,
  Gamepad2,
  ShoppingCart,
  CreditCard,
  PhoneCall,
  RotateCcw,
} from "lucide-react";
import { InspectPayloadModal } from "./InspectPayloadModal";
import { useRouter } from "next/navigation";

interface ActivityLogsClientProps {
  initialLogs: any[];
}

export function ActivityLogsClient({ initialLogs }: ActivityLogsClientProps) {
  const router = useRouter();
  const [logs, setLogs] = React.useState<any[]>(initialLogs);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedEntity, setSelectedEntity] = React.useState<string>("ALL");
  const [selectedAction, setSelectedAction] = React.useState<string>("ALL");
  const [selectedLog, setSelectedLog] = React.useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Sync state if initialLogs change
  React.useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  // Filtered logs
  const filteredLogs = React.useMemo(() => {
    return logs.filter((item) => {
      // Entity filter
      if (selectedEntity !== "ALL" && item.entity !== selectedEntity) {
        return false;
      }
      // Action filter
      if (selectedAction !== "ALL" && item.action !== selectedAction) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const desc = (item.description || "").toLowerCase();
        const email = (item.admin_email || "").toLowerCase();
        const entityId = (item.entity_id || "").toLowerCase();
        const role = (item.admin_role || "").toLowerCase();
        const ip = (item.ip_address || "").toLowerCase();
        return (
          desc.includes(query) ||
          email.includes(query) ||
          entityId.includes(query) ||
          role.includes(query) ||
          ip.includes(query)
        );
      }
      return true;
    });
  }, [logs, selectedEntity, selectedAction, searchQuery]);

  // Statistics Calculation
  const stats = React.useMemo(() => {
    const total = logs.length;
    const catalogCount = logs.filter((l) => ["game", "category", "product"].includes(l.entity)).length;
    const transactionCount = logs.filter((l) => ["order", "payment_channel"].includes(l.entity)).length;
    const uniqueOperators = new Set(logs.map((l) => l.admin_email)).size;

    return { total, catalogCount, transactionCount, uniqueOperators };
  }, [logs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleOpenInspect = (log: any) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "UPDATE":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "DELETE":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "APPROVE":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "DUPLICATE":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "TOGGLE_STATUS":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "game":
        return <Gamepad2 className="w-3.5 h-3.5 text-blue-400" />;
      case "category":
        return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
      case "product":
        return <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />;
      case "order":
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      case "payment_channel":
        return <CreditCard className="w-3.5 h-3.5 text-purple-400" />;
      case "contact_settings":
        return <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "Baru saja";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} mnt lalu`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Activity Logs</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-primary/30 bg-primary/10 text-primary shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Audit Trail
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Riwayat lengkap seluruh tindakan operasional, manipulasi data katalog, dan perubahan pengaturan toko.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 rounded-xl bg-background/60 border-border/60 hover:bg-background/90"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Segarkan</span>
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl bg-card/60 backdrop-blur-xl border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Log</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.total}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tercatat di sistem</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Activity className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-card/60 backdrop-blur-xl border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Katalog & Layanan</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-400">{stats.catalogCount}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Games, kategori & produk</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Gamepad2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-card/60 backdrop-blur-xl border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaksi & Bayar</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-400">{stats.transactionCount}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Orders & payment channels</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-card/60 backdrop-blur-xl border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operator Aktif</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">{stats.uniqueOperators}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Akun yang beraktivitas</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/60 flex flex-col md:flex-row items-center gap-3 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan email operator, invoice, ID target, atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-background/60 border-border/60 text-sm"
          />
        </div>

        {/* Entity Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="h-10 px-3 rounded-xl bg-background/60 border border-border/60 text-xs font-medium text-foreground w-full md:w-44 focus:outline-hidden"
          >
            <option value="ALL">Semua Modul</option>
            <option value="game">🎮 Games</option>
            <option value="category">📁 Kategori</option>
            <option value="product">🛍️ Produk & Harga</option>
            <option value="order">🧾 Orders</option>
            <option value="payment_channel">💳 Saluran Bayar</option>
            <option value="contact_settings">📱 Kontak & Branding</option>
          </select>

          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-10 px-3 rounded-xl bg-background/60 border border-border/60 text-xs font-medium text-foreground w-full md:w-40 focus:outline-hidden"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="CREATE">CREATE (Tambah)</option>
            <option value="UPDATE">UPDATE (Edit)</option>
            <option value="DELETE">DELETE (Hapus)</option>
            <option value="APPROVE">APPROVE (Setujui)</option>
            <option value="DUPLICATE">DUPLICATE (Salin)</option>
            <option value="TOGGLE_STATUS">TOGGLE (Status)</option>
            <option value="REORDER">REORDER (Urutan)</option>
          </select>

          {(searchQuery || selectedEntity !== "ALL" || selectedAction !== "ALL") && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchQuery("");
                setSelectedEntity("ALL");
                setSelectedAction("ALL");
              }}
              title="Reset Filter"
              className="rounded-xl shrink-0 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Activity Table */}
      <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground border-b border-border/50 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 w-44">Waktu</th>
                <th className="px-5 py-4 w-56">Operator & Role</th>
                <th className="px-5 py-4 w-48">Aksi & Modul</th>
                <th className="px-5 py-4">Deskripsi Aktivitas</th>
                <th className="px-5 py-4 w-36">IP & Perangkat</th>
                <th className="px-5 py-4 w-28 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground space-y-2">
                    <Activity className="w-8 h-8 mx-auto text-muted-foreground/50 animate-pulse" />
                    <p className="font-semibold text-sm">Tidak ada log aktivitas ditemukan</p>
                    <p className="text-xs text-muted-foreground">
                      {logs.length === 0
                        ? "Belum ada riwayat aktivitas yang tercatat di sistem."
                        : "Coba ubah kata kunci pencarian atau filter Anda."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    {/* Time */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium text-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(log.created_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                          {formatRelativeTime(log.created_at)}
                        </span>
                      </div>
                    </td>

                    {/* Operator */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold text-foreground truncate max-w-[200px]" title={log.admin_email}>
                        {log.admin_email}
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Shield className="w-2.5 h-2.5" />
                          <span>{log.admin_role || "Operator"}</span>
                        </span>
                      </div>
                    </td>

                    {/* Action & Entity */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted/60 border border-border/50 text-foreground">
                          {getEntityIcon(log.entity)}
                          <span>{log.entity}</span>
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-4 align-top">
                      <p className="text-sm font-medium text-foreground leading-snug break-words">
                        {log.description}
                      </p>
                      {log.entity_id && (
                        <span className="inline-block mt-1 font-mono text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-border/40">
                          ID: {log.entity_id}
                        </span>
                      )}
                    </td>

                    {/* IP & Device */}
                    <td className="px-5 py-4 align-top text-xs">
                      <div className="font-mono text-muted-foreground">
                        {log.ip_address || "127.0.0.1"}
                      </div>
                      {log.user_agent && (
                        <div className="text-[10px] text-muted-foreground/70 truncate max-w-[130px] mt-0.5" title={log.user_agent}>
                          {log.user_agent.split(" ")[0]}
                        </div>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="px-5 py-4 align-top text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenInspect(log)}
                        className="gap-1.5 text-xs rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Payload Modal */}
      <InspectPayloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        log={selectedLog}
      />
    </div>
  );
}
