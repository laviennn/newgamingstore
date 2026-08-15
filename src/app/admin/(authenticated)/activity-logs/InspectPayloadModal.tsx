"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Copy,
  Check,
  Globe,
  Monitor,
  User,
  Clock,
  Code2,
  FileDiff,
  Shield,
  Layers,
} from "lucide-react";

interface InspectPayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any | null;
}

export function InspectPayloadModal({ isOpen, onClose, log }: InspectPayloadModalProps) {
  const [activeTab, setActiveTab] = React.useState<"diffs" | "raw">("diffs");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setCopied(false);
      // If diffs exist, default to diffs tab, otherwise raw
      if (log?.payload?.diffs && Array.isArray(log.payload.diffs) && log.payload.diffs.length > 0) {
        setActiveTab("diffs");
      } else {
        setActiveTab("raw");
      }
    }
  }, [isOpen, log]);

  if (!log) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log.payload || {}, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const hasDiffs = log.payload?.diffs && Array.isArray(log.payload.diffs) && log.payload.diffs.length > 0;

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return <span className="text-muted-foreground italic">null</span>;
    if (typeof val === "boolean") {
      return (
        <span className={val ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
          {String(val)}
        </span>
      );
    }
    if (typeof val === "object") {
      return (
        <pre className="text-[11px] font-mono whitespace-pre-wrap max-h-24 overflow-y-auto bg-background/50 p-1 rounded">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }
    return <span className="break-all">{String(val)}</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] rounded-[28px] max-h-[90vh] flex flex-col">
        {/* Glow ambient background */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-blue-500/15 blur-[60px] rounded-full pointer-events-none" />

        <div className="p-6 sm:p-7 relative z-10 border-b border-border/50 shrink-0 space-y-4">
          {/* Header Title & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>Detail Log Aktivitas</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getActionBadgeClass(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-muted/50 text-foreground uppercase tracking-wider">
                    {log.entity}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {log.description}
                </DialogDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyJson}
              className="gap-1.5 text-xs rounded-xl self-start sm:self-auto bg-background/60 border-border/60 hover:bg-background/90"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Tersalin!" : "Salin JSON"}
            </Button>
          </div>

          {/* Operator & Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-background/40 border border-border/40 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground">Operator</div>
                <div className="font-semibold truncate text-foreground" title={log.admin_email}>
                  {log.admin_email}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-background/40 border border-border/40 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground">Role</div>
                <div className="font-semibold truncate text-foreground">
                  {log.admin_role || "Operator"}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-background/40 border border-border/40 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground">IP Address</div>
                <div className="font-mono text-xs truncate text-foreground">
                  {log.ip_address || "127.0.0.1"}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-background/40 border border-border/40 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground">Waktu</div>
                <div className="text-xs truncate text-foreground">
                  {new Date(log.created_at).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-border/40 bg-muted/10 shrink-0">
          {hasDiffs && (
            <button
              type="button"
              onClick={() => setActiveTab("diffs")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "diffs"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileDiff className="w-3.5 h-3.5" />
              <span>Perbandingan Atribut (Diffs)</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-bold">
                {log.payload.diffs.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("raw")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "raw"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw JSON Payload</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === "diffs" && hasDiffs ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Rincian Perubahan Nilai Field ({log.payload.diffs.length} Field)</span>
              </div>

              <div className="border border-border/50 rounded-2xl overflow-hidden bg-background/50 shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground border-b border-border/50 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-1/4">Nama Field</th>
                      <th className="px-4 py-3 w-[37.5%]">Nilai Sebelumnya (Before)</th>
                      <th className="px-4 py-3 w-[37.5%]">Nilai Diperbarui (After)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {log.payload.diffs.map((d: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-foreground">
                          {d.field}
                        </td>
                        <td className="px-4 py-3 bg-rose-500/5 text-rose-300">
                          {formatValue(d.from)}
                        </td>
                        <td className="px-4 py-3 bg-emerald-500/5 text-emerald-300">
                          {formatValue(d.to)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider">Payload Object (JSON)</span>
                <span className="text-[11px] font-mono">
                  {Object.keys(log.payload || {}).length} root keys
                </span>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 font-mono text-xs overflow-x-auto max-h-[380px] shadow-inner text-emerald-400">
                <pre className="whitespace-pre-wrap">{JSON.stringify(log.payload || {}, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* User Agent Footer */}
          {log.user_agent && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/40 text-[11px] text-muted-foreground">
              <Monitor className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate" title={log.user_agent}>
                {log.user_agent}
              </span>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="p-4 sm:px-7 bg-muted/20 border-t border-border/50 flex justify-end shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-5 bg-background/60 border-border/60 hover:bg-background/90"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
