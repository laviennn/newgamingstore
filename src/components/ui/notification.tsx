"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  onClose: () => void;
}

export function Notification({ type, title, message, onClose }: NotificationProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const variants = {
    success: {
      container: "border-emerald-500/30 bg-[#0c1e15]/95 text-emerald-300 shadow-emerald-950/50",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />,
    },
    error: {
      container: "border-rose-500/30 bg-[#200e12]/95 text-rose-300 shadow-rose-950/50",
      icon: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />,
    },
    warning: {
      container: "border-amber-500/30 bg-[#22170a]/95 text-amber-300 shadow-amber-950/50",
      icon: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />,
    },
    info: {
      container: "border-sky-500/30 bg-[#0c1728]/95 text-sky-300 shadow-sky-950/50",
      icon: <Info className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />,
    },
  };

  const active = variants[type] || variants.info;

  return (
    <div 
      className={`fixed z-[9999] bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto max-w-sm mx-auto md:mx-0 w-auto transform animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${active.container}`}
    >
      <div className="flex-shrink-0">{active.icon}</div>
      <div className="flex-1 space-y-0.5 min-w-0 pr-2">
        <p className="text-sm font-bold text-white leading-snug truncate">{title}</p>
        {message && <p className="text-xs text-gray-300 leading-relaxed break-words">{message}</p>}
      </div>
      <button 
        onClick={onClose}
        className="inline-flex flex-shrink-0 rounded-lg p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Global hook to use notifications easily
export function useNotification() {
  const [notification, setNotification] = React.useState<Omit<NotificationProps, "onClose"> | null>(null);

  const showNotification = (type: NotificationType, title: string, message?: string) => {
    setNotification({ type, title, message });
  };

  const NotificationComponent = notification ? (
    <Notification 
      {...notification} 
      onClose={() => setNotification(null)} 
    />
  ) : null;

  return { showNotification, NotificationComponent };
}
