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
      container: "border-green-500/20 bg-green-50/80 dark:bg-green-950/80 text-green-800 dark:text-green-200 shadow-green-500/10",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    },
    error: {
      container: "border-red-500/20 bg-red-50/80 dark:bg-red-950/80 text-red-800 dark:text-red-200 shadow-red-500/10",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
    warning: {
      container: "border-orange-500/20 bg-orange-50/80 dark:bg-orange-950/80 text-orange-800 dark:text-orange-200 shadow-orange-500/10",
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    },
    info: {
      container: "border-blue-500/20 bg-blue-50/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 shadow-blue-500/10",
      icon: <Info className="h-5 w-5 text-blue-500" />,
    },
  };

  const active = variants[type] || variants.info;

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex max-w-sm w-full transform animate-in slide-in-from-bottom-5 fade-in duration-300 items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md ${active.container}`}>
      <div className="mt-0.5 flex-shrink-0">{active.icon}</div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      <button 
        onClick={onClose}
        className="inline-flex flex-shrink-0 rounded-lg p-1 opacity-50 hover:bg-black/5 hover:opacity-100 transition-all dark:hover:bg-white/10"
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
