"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PurchaseNotificationProps {
  tenantName: string;
}

type NotificationItem = {
  gameName: string;
  gameImage: string;
  itemName: string;
};

// Define 2-4 items for each of the 9 games
const DUMMY_NOTIFICATIONS: NotificationItem[] = [
  // Mobile Legends
  { gameName: "Mobile Legends", gameImage: "https://assets.newgamingstore.com/1785643742978-756714716-Archer_aiming_bow_with_logo_202608021058.jpeg", itemName: "50 (45+5) Diamond" },
  { gameName: "Mobile Legends", gameImage: "https://assets.newgamingstore.com/1785643742978-756714716-Archer_aiming_bow_with_logo_202608021058.jpeg", itemName: "170 (154+16) Diamond" },
  { gameName: "Mobile Legends", gameImage: "https://assets.newgamingstore.com/1785643742978-756714716-Archer_aiming_bow_with_logo_202608021058.jpeg", itemName: "284 (258+26) Diamond" },
  { gameName: "Mobile Legends", gameImage: "https://assets.newgamingstore.com/1785643742978-756714716-Archer_aiming_bow_with_logo_202608021058.jpeg", itemName: "878 (798+80) Diamond" },
  
  // Genshin Impact
  { gameName: "Genshin Impact", gameImage: "https://assets.newgamingstore.com/1785646055780-509961279-Genshin_Impact_characters_purple_202608021146-2.webp", itemName: "60 Genesis Crystals" },
  { gameName: "Genshin Impact", gameImage: "https://assets.newgamingstore.com/1785646055780-509961279-Genshin_Impact_characters_purple_202608021146-2.webp", itemName: "300+30 Genesis Crystals" },
  { gameName: "Genshin Impact", gameImage: "https://assets.newgamingstore.com/1785646055780-509961279-Genshin_Impact_characters_purple_202608021146-2.webp", itemName: "980+110 Genesis Crystals" },
  
  // Valorant
  { gameName: "Valorant", gameImage: "https://assets.newgamingstore.com/1785645451915-504135596-Woman_pointing_gun_Valorant_logo_202608021132_11zon.webp", itemName: "420 Points" },
  { gameName: "Valorant", gameImage: "https://assets.newgamingstore.com/1785645451915-504135596-Woman_pointing_gun_Valorant_logo_202608021132_11zon.webp", itemName: "1250 Points" },
  { gameName: "Valorant", gameImage: "https://assets.newgamingstore.com/1785645451915-504135596-Woman_pointing_gun_Valorant_logo_202608021132_11zon.webp", itemName: "2500 Points" },

  // PUBG Mobile
  { gameName: "PUBG Mobile", gameImage: "https://assets.newgamingstore.com/1785645373711-11502655-Man_saluting_with_game_logo_202608021129_11zon.jpeg", itemName: "60 UC" },
  { gameName: "PUBG Mobile", gameImage: "https://assets.newgamingstore.com/1785645373711-11502655-Man_saluting_with_game_logo_202608021129_11zon.jpeg", itemName: "325 UC" },
  { gameName: "PUBG Mobile", gameImage: "https://assets.newgamingstore.com/1785645373711-11502655-Man_saluting_with_game_logo_202608021129_11zon.jpeg", itemName: "660 UC" },

  // Call Of Duty Mobile
  { gameName: "Call Of Duty Mobile", gameImage: "https://assets.newgamingstore.com/1785645982923-96548894-Call_of_Duty_Mobile_characters_202608021143_11zon.webp", itemName: "420 CP" },
  { gameName: "Call Of Duty Mobile", gameImage: "https://assets.newgamingstore.com/1785645982923-96548894-Call_of_Duty_Mobile_characters_202608021143_11zon.webp", itemName: "880 CP" },
  { gameName: "Call Of Duty Mobile", gameImage: "https://assets.newgamingstore.com/1785645982923-96548894-Call_of_Duty_Mobile_characters_202608021143_11zon.webp", itemName: "2400 CP" },

  // Honor Of Kings
  { gameName: "Honor Of Kings", gameImage: "https://assets.newgamingstore.com/1785643240561-131792648-honor-of-king.webp", itemName: "60 Tokens" },
  { gameName: "Honor Of Kings", gameImage: "https://assets.newgamingstore.com/1785643240561-131792648-honor-of-king.webp", itemName: "300 Tokens" },
  { gameName: "Honor Of Kings", gameImage: "https://assets.newgamingstore.com/1785643240561-131792648-honor-of-king.webp", itemName: "680 Tokens" },

  // FC Mobile
  { gameName: "FC Mobile", gameImage: "https://assets.newgamingstore.com/1785645315122-404379389-Soccer_player_in_uniform_purple_202608021124_11zon.webp", itemName: "100 FC Points" },
  { gameName: "FC Mobile", gameImage: "https://assets.newgamingstore.com/1785645315122-404379389-Soccer_player_in_uniform_purple_202608021124_11zon.webp", itemName: "1050 FC Points" },

  // Heartopia
  { gameName: "Heartopia", gameImage: "https://assets.newgamingstore.com/1785646904466-194849548-Heartopia_characters_in_town_202608021200_11zon.webp", itemName: "60 Crystals" },
  { gameName: "Heartopia", gameImage: "https://assets.newgamingstore.com/1785646904466-194849548-Heartopia_characters_in_town_202608021200_11zon.webp", itemName: "300 Crystals" },

  // Roblox
  { gameName: "Roblox", gameImage: "https://assets.newgamingstore.com/1785643214021-467878991-Roblox_characters_celebrating_wi_202608021058.jpeg", itemName: "80 Robux" },
  { gameName: "Roblox", gameImage: "https://assets.newgamingstore.com/1785643214021-467878991-Roblox_characters_celebrating_wi_202608021058.jpeg", itemName: "400 Robux" },
  { gameName: "Roblox", gameImage: "https://assets.newgamingstore.com/1785643214021-467878991-Roblox_characters_celebrating_wi_202608021058.jpeg", itemName: "800 Robux" }
];

// Helper to generate a random masked phone number like 628*******513
function generateRandomPhoneNumber() {
  const prefix = "628";
  const suffix = Math.floor(100 + Math.random() * 900).toString(); // 3 random digits
  return `${prefix}*******${suffix}`;
}

export function PurchaseNotification({ tenantName }: PurchaseNotificationProps) {
  const [activeItem, setActiveItem] = useState<NotificationItem | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial delay before starting the loop
    const initialTimeout = setTimeout(() => {
      showNextNotification();
    }, 3000);

    return () => clearTimeout(initialTimeout);
  }, []);

  const showNextNotification = () => {
    const randomItem = DUMMY_NOTIFICATIONS[Math.floor(Math.random() * DUMMY_NOTIFICATIONS.length)];
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
        "md:top-auto md:bottom-6 md:left-6 md:right-auto md:w-auto md:mx-0",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 -translate-y-6 md:translate-y-10 pointer-events-none"
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
            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20 shrink-0" />
            <p className="text-[11px] md:text-xs text-gray-400 truncate">
              Verified by {tenantName || "Yowanastore"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
