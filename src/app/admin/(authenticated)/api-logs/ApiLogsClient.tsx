"use client";

import React, { useState, useTransition } from "react";
import { 
  Activity, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Server, 
  Zap, 
  Database,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getApiValidationLogs, getApiValidationStats } from "./actions";

interface ApiLogsClientProps {
  initialLogs: any[];
  initialTotal: number;
  initialStats: {
    totalCalls: number;
    vipResellerHits: number;
    kokinpayHits: number;
    rapidApiHits: number;
    vipSuccess: number;
    kokinpaySuccess: number;
    rapidSuccess: number;
    avgLatencyMs: number;
    rapidLimit: number | null;
    rapidRemaining: number | null;
  };
}

export function ApiLogsClient({ initialLogs, initialTotal, initialStats }: ApiLogsClientProps) {
  const [logs, setLogs] = useState<any[]>(initialLogs);
  const [total, setTotal] = useState<number>(initialTotal);
  const [stats, setStats] = useState(initialStats);

  const [page, setPage] = useState(1);
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const limit = 20;
  const totalPages = Math.ceil(total / limit) || 1;

  const fetchLogs = (newPage: number, prov: string, stat: string, search: string) => {
    startTransition(async () => {
      const [res, newStats] = await Promise.all([
        getApiValidationLogs({ page: newPage, limit, provider: prov, status: stat, search }),
        getApiValidationStats(),
      ]);

      if (res.success) {
        setLogs(res.logs);
        setTotal(res.total);
        setPage(newPage);
      }
      setStats(newStats);
    });
  };

  const handleRefresh = () => {
    fetchLogs(page, providerFilter, statusFilter, searchQuery);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1, providerFilter, statusFilter, searchQuery);
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProv = e.target.value;
    setProviderFilter(newProv);
    fetchLogs(1, newProv, statusFilter, searchQuery);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStat = e.target.value;
    setStatusFilter(newStat);
    fetchLogs(1, providerFilter, newStat, searchQuery);
  };

  // Quota calculation for RapidAPI
  const rapidQuotaPercent = (stats.rapidLimit && stats.rapidRemaining !== null && stats.rapidLimit > 0)
    ? Math.round((stats.rapidRemaining / stats.rapidLimit) * 100)
    : null;

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Calls */}
        <div className="bg-background border border-border/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Request Check</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalCalls.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Rata-rata latency: <span className="font-semibold text-foreground">{stats.avgLatencyMs} ms</span>
          </div>
        </div>

        {/* VIP Reseller Usage */}
        <div className="bg-background border border-border/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">VIP Reseller Hits</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.vipResellerHits.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Success: <span className="font-semibold text-emerald-500">{stats.vipSuccess}</span> / {stats.vipResellerHits} ({stats.vipResellerHits > 0 ? Math.round((stats.vipSuccess / stats.vipResellerHits) * 100) : 0}%)
          </div>
        </div>

        {/* KokinPay Usage */}
        <div className="bg-[#121212] border border-border/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">KokinPay Hits</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.kokinpayHits.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Success: <span className="font-semibold text-orange-400">{stats.kokinpaySuccess}</span> / {stats.kokinpayHits} ({stats.kokinpayHits > 0 ? Math.round((stats.kokinpaySuccess / stats.kokinpayHits) * 100) : 0}%)
          </div>
        </div>

        {/* RapidAPI Usage */}
        <div className="bg-[#121212] border border-border/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">RapidAPI Hits</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.rapidApiHits.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Success: <span className="font-semibold text-purple-400">{stats.rapidSuccess}</span> / {stats.rapidApiHits} ({stats.rapidApiHits > 0 ? Math.round((stats.rapidSuccess / stats.rapidApiHits) * 100) : 0}%)
          </div>
        </div>

        {/* RapidAPI Remaining Quota */}
        <div className="bg-background border border-border/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">RapidAPI Kuota Bulanan</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          {stats.rapidRemaining !== null ? (
            <>
              <div className="text-2xl font-bold text-foreground">
                {stats.rapidRemaining.toLocaleString()}{" "}
                <span className="text-xs font-medium text-muted-foreground">
                  / {stats.rapidLimit ? stats.rapidLimit.toLocaleString() : "∞"}
                </span>
              </div>
              <div className="mt-2 w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    (rapidQuotaPercent ?? 100) > 30 
                      ? 'bg-amber-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, rapidQuotaPercent ?? 0))}%` }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 flex justify-between">
                <span>Sisa Kuota: {rapidQuotaPercent}%</span>
                <span>Header x-ratelimit</span>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground py-2">
              Belum ada data header RapidAPI
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="bg-background border border-border/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari Target ID / Game / Username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/40 border border-border/60 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shrink-0"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Provider Select */}
          <select
            value={providerFilter}
            onChange={handleProviderChange}
            disabled={isPending}
            className="bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
          >
            <option value="ALL">Semua Provider</option>
            <option value="vip-reseller">VIP Reseller</option>
            <option value="kokinpay">KokinPay</option>
            <option value="rapidapi">RapidAPI</option>
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            disabled={isPending}
            className="bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
          >
            <option value="ALL">Semua Status</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="TIMEOUT">TIMEOUT</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            className="p-2 border border-border/60 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-background border border-border/60 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border/60 text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Game Code</th>
                <th className="px-4 py-3">Target ID</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Hasil / Nickname</th>
                <th className="px-4 py-3 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const dateFormatted = new Date(log.created_at).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  return (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                        {dateFormatted}
                      </td>
                      <td className="px-4 py-3.5 font-bold uppercase text-foreground">
                        {log.game_code}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs">
                        <span className="font-semibold text-foreground">{log.user_id}</span>
                        {log.server_id && (
                          <span className="text-muted-foreground ml-1">({log.server_id})</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {log.provider === "vip-reseller" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            VIP Reseller
                          </span>
                        ) : log.provider === "kokinpay" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            KokinPay
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            RapidAPI
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {log.status === "SUCCESS" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                          </span>
                        )}
                        {log.status === "FAILED" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
                            <XCircle className="w-3.5 h-3.5" /> FAILED
                          </span>
                        )}
                        {log.status === "TIMEOUT" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                            <Clock className="w-3.5 h-3.5" /> TIMEOUT
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs truncate text-xs">
                        {log.result_username ? (
                          <span className="font-bold text-foreground">{log.result_username}</span>
                        ) : (
                          <span className="text-muted-foreground italic">{log.message || "-"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {log.execution_time_ms ? `${log.execution_time_ms} ms` : "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    {isPending ? "Memuat data log..." : "Belum ada data log validasi."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-muted/20 border-t border-border/60 px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Menampilkan <span className="font-semibold text-foreground">{logs.length}</span> dari{" "}
            <span className="font-semibold text-foreground">{total}</span> total log
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLogs(page - 1, providerFilter, statusFilter, searchQuery)}
              disabled={page <= 1 || isPending}
              className="p-1.5 border border-border/60 rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Halaman {page} dari {totalPages}</span>
            <button
              onClick={() => fetchLogs(page + 1, providerFilter, statusFilter, searchQuery)}
              disabled={page >= totalPages || isPending}
              className="p-1.5 border border-border/60 rounded-lg disabled:opacity-40 hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
