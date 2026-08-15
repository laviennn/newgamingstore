"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  gameName: string;
  gameImage: string;
  itemName: string;
};

interface PurchaseNotificationProps {
  tenantName: string;
  notifications: NotificationItem[];
}

// Helper to generate a random masked phone number like 628*******513
function generateRandomPhoneNumber() {
  const prefix = "628";
  const suffix = Math.floor(100 + Math.random() * 900).toString(); // 3 random digits
  return `${prefix}*******${suffix}`;
}

export function PurchaseNotification({ tenantName, notifications }: PurchaseNotificationProps) {
  const [activeItem, setActiveItem] = useState<NotificationItem | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Initial delay before starting the loop
    const initialTimeout = setTimeout(() => {
      showNextNotification();
    }, 3000);

    return () => clearTimeout(initialTimeout);
  }, [notifications]);

  const showNextNotification = () => {
    if (!notifications || notifications.length === 0) return;

    const randomItem = notifications[Math.floor(Math.random() * notifications.length)];
    setActiveItem(randomItem);
    setPhoneNumber(generateRandomPhoneNumber());
    setIsVisible(true);

    // Hide after 4 seconds
    setTimeout(() => {
      setIsVisible(false);

      // Wait for a random time between 5s to 12s before showing the next one
      const nextDelay = Math.floor(Math.random() * (12000 - 5000 + 1) + 5000);
      setTimeout(() => {
        showNextNotification();
      }, nextDelay);

    }, 4000);
  };

  if (!activeItem) return null;

  return (
    <div
      className={cn(
        "fixed z-40 transition-all duration-500 ease-in-out",
        "top-20 left-4 right-4 max-w-[340px] mx-auto",
        "md:top-24 md:left-6 md:right-auto md:w-auto md:mx-0",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-6 md:-translate-y-10 pointer-events-none"
      )}
    >
      <div className="bg-[#111]/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center gap-3.5">
        {/* Game Image */}
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
          <Image
            src={activeItem.gameImage}
            alt={activeItem.gameName}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <p className="text-xs md:text-sm font-medium text-gray-300 truncate">
            {phoneNumber} Telah Membeli
          </p>
          <p className="text-xs md:text-sm font-bold text-white truncate">
            {activeItem.itemName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <BadgeCheck className="w-3.5 h-3.5 text-theme-primary fill-blue-500/20 shrink-0" />
            <p className="text-[11px] md:text-xs text-gray-400 truncate">
              Verified by {tenantName || "Yowanastore"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
