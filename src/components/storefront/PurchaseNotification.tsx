"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDictionary, Language } from "@/lib/dictionary";
import { Currency, getLanguageFromCurrency, getProductName } from "@/lib/currencyUtils";

export type NotificationItem = {
  gameName: string;
  gameImage: string;
  itemName: string;
  names?: Record<string, string> | null;
};

interface PurchaseNotificationProps {
  tenantName: string;
  notifications: NotificationItem[];
  language?: Language;
  supportedCurrencies?: Currency[];
}

// Helper to generate realistic masked phone numbers based on country/currency
function generateRandomPhoneNumber(currency: Currency = "IDR"): string {
  if (currency === "MYR") {
    // Malaysian mobile prefixes: 6011, 6012, 6013, 6014, 6016, 6017, 6018, 6019
    const myPrefixes = ["6011", "6012", "6013", "6014", "6016", "6017", "6018", "6019"];
    const prefix = myPrefixes[Math.floor(Math.random() * myPrefixes.length)];
    const suffix = Math.floor(100 + Math.random() * 900).toString(); // 3 random digits
    return `${prefix}****${suffix}`;
  } else if (currency === "SGD") {
    // Singapore mobile prefixes: 6581, 6582, 6583, 6584, 6585, 6591, 6592, 6593, 6594
    const sgPrefixes = ["6581", "6582", "6583", "6584", "6585", "6591", "6592", "6593", "6594"];
    const prefix = sgPrefixes[Math.floor(Math.random() * sgPrefixes.length)];
    const suffix = Math.floor(100 + Math.random() * 900).toString();
    return `${prefix}****${suffix}`;
  } else if (currency === "PHP") {
    const phPrefixes = ["6391", "6392", "6393", "6394", "6397", "6398", "6399"];
    const prefix = phPrefixes[Math.floor(Math.random() * phPrefixes.length)];
    const suffix = Math.floor(100 + Math.random() * 900).toString();
    return `${prefix}****${suffix}`;
  } else if (currency === "INR") {
    const inPrefixes = ["9198", "9197", "9196", "9191", "9188", "9170"];
    const prefix = inPrefixes[Math.floor(Math.random() * inPrefixes.length)];
    const suffix = Math.floor(100 + Math.random() * 900).toString();
    return `${prefix}****${suffix}`;
  } else if (currency === "USD") {
    const usPrefixes = ["1202", "1312", "1415", "1646", "1718", "1917"];
    const prefix = usPrefixes[Math.floor(Math.random() * usPrefixes.length)];
    const suffix = Math.floor(100 + Math.random() * 900).toString();
    return `${prefix}****${suffix}`;
  } else {
    // Indonesian mobile prefixes: 62812, 62813, 62821, 62852, 62857, 62877, 62878, 62896
    const idPrefixes = ["62812", "62813", "62821", "62852", "62857", "62877", "62878", "62896"];
    const prefix = idPrefixes[Math.floor(Math.random() * idPrefixes.length)];
    const suffix = Math.floor(100 + Math.random() * 900).toString();
    return `${prefix}****${suffix}`;
  }
}

// Helper to generate a realistic relative time string
function generateRelativeTime(dict: ReturnType<typeof getDictionary>): string {
  const isSeconds = Math.random() > 0.35;
  if (isSeconds) {
    const sec = Math.floor(Math.random() * 45) + 12; // 12-57 seconds ago
    return `${sec} ${dict.notification_secs_ago}`;
  } else {
    const min = Math.floor(Math.random() * 3) + 1; // 1-3 minutes ago
    return `${min} ${dict.notification_mins_ago}`;
  }
}

export function PurchaseNotification({ 
  tenantName, 
  notifications, 
  language = "id",
  supportedCurrencies = ["IDR"],
}: PurchaseNotificationProps) {
  const [activeItem, setActiveItem] = useState<{
    gameName: string;
    gameImage: string;
    displayItemName: string;
    phoneNumber: string;
    actionText: string;
    verifiedText: string;
    timeAgo: string;
  } | null>(null);
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Initial delay before starting the loop
    const initialTimeout = setTimeout(() => {
      showNextNotification();
    }, 3000);

    return () => clearTimeout(initialTimeout);
  }, [notifications, language, supportedCurrencies]);

  const showNextNotification = () => {
    if (!notifications || notifications.length === 0) return;

    // 1. Pick random product
    const randomItem = notifications[Math.floor(Math.random() * notifications.length)];

    // 2. Multi-Currency Mix: Pick random currency from supportedCurrencies
    const activeCurrencies = supportedCurrencies && supportedCurrencies.length > 0
      ? supportedCurrencies
      : ["IDR" as Currency];
    const pickedCurrency = activeCurrencies[Math.floor(Math.random() * activeCurrencies.length)];

    // 3. Derive country-specific dictionary, phone number & denomination
    const pickedLang = getLanguageFromCurrency(pickedCurrency);
    const dict = getDictionary(pickedLang);
    const phoneNumber = generateRandomPhoneNumber(pickedCurrency);
    const displayItemName = getProductName(
      { name: randomItem.itemName, names: randomItem.names },
      pickedCurrency
    );
    const timeAgo = generateRelativeTime(dict);

    setActiveItem({
      gameName: randomItem.gameName,
      gameImage: randomItem.gameImage,
      displayItemName,
      phoneNumber,
      actionText: dict.notification_bought,
      verifiedText: `${dict.notification_verified} ${tenantName || "Store"}`,
      timeAgo,
    });

    setIsVisible(true);

    // Hide after 4.5 seconds
    setTimeout(() => {
      setIsVisible(false);

      // Wait for a random delay between 5s to 12s before showing the next one
      const nextDelay = Math.floor(Math.random() * (12000 - 5000 + 1) + 5000);
      setTimeout(() => {
        showNextNotification();
      }, nextDelay);

    }, 4500);
  };

  if (!activeItem) return null;

  return (
    <div
      className={cn(
        "fixed z-40 transition-all duration-500 ease-in-out",
        "top-20 left-4 right-4 max-w-[360px] mx-auto",
        "md:top-auto md:bottom-6 md:left-6 md:right-auto md:w-auto md:mx-0",
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-4 md:translate-y-6 scale-95 pointer-events-none"
      )}
    >
      <div className="bg-[#111]/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center gap-3.5">
        {/* Game Image */}
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shrink-0 border border-white/10">
          <Image
            src={activeItem.gameImage}
            alt={activeItem.gameName}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-0.5 overflow-hidden flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium text-gray-300 truncate">
            <span className="font-semibold text-white">{activeItem.phoneNumber}</span> {activeItem.actionText}
          </p>
          <p className="text-xs md:text-sm font-bold text-white truncate">
            {activeItem.displayItemName}
          </p>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <BadgeCheck className="w-3.5 h-3.5 text-theme-primary fill-blue-500/20 shrink-0" />
              <p className="text-[11px] md:text-xs text-gray-400 truncate">
                {activeItem.verifiedText}
              </p>
            </div>
            {activeItem.timeAgo && (
              <span className="text-[10px] text-gray-500 shrink-0">
                • {activeItem.timeAgo}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
