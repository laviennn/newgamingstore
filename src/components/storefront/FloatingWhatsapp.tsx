"use client";

import * as React from "react";
import Image from "next/image";

interface FloatingWhatsappProps {
  whatsapp?: string;
  active?: boolean;
  avatarUrl?: string;
  text?: string;
  customMessage?: string;
}

export function FloatingWhatsapp({
  whatsapp,
  active = true,
  avatarUrl,
  text = "Chat CS Online",
  customMessage,
}: FloatingWhatsappProps) {
  if (!active || !whatsapp) return null;

  const fixUrl = (url: string | null) => {
    if (!url) return '';
    return url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com');
  };

  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanWhatsapp}${customMessage ? `?text=${encodeURIComponent(customMessage)}` : ''}`;

  const finalAvatarUrl = avatarUrl ? fixUrl(avatarUrl) : null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-3 group">
      {/* Speech Bubble */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:flex items-center gap-2 bg-card/90 backdrop-blur-md text-foreground border border-border px-4 py-2 rounded-2xl shadow-xl transition-all duration-300 transform group-hover:scale-105 group-hover:border-primary/50 group-hover:shadow-primary/20"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold tracking-wide">{text}</span>
      </a>

      {/* Character Avatar Container */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp"
        className="relative flex items-end justify-center cursor-pointer transition-transform duration-300 transform group-hover:scale-110 active:scale-95"
      >
        {finalAvatarUrl ? (
          <div className="relative w-28 h-36 md:w-36 md:h-48 flex items-end justify-center drop-shadow-[0_15px_30px_rgba(16,185,129,0.35)]">
            <Image
              src={finalAvatarUrl}
              alt="CS Character"
              fill
              sizes="(max-width: 768px) 144px, 200px"
              className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
            />
            {/* Small WA icon badge attached to character */}
            <div className="absolute bottom-1 right-0 w-7 h-7 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white shadow-lg z-10 animate-bounce">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
            </div>
          </div>
        ) : (
          /* Fallback Circle Badge if no avatar URL is provided */
          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl border-2 border-background">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </div>
        )}
      </a>
    </div>
  );
}
