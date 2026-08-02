"use client";

import React from "react";

interface SkeuoToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeText?: string;
  inactiveText?: string;
  className?: string;
}

/**
 * Skeuomorphism 2.0 Segmented Tactile Switch for Forms
 */
export function SkeuoToggle({
  checked,
  onChange,
  activeText = "Aktif",
  inactiveText = "Nonaktif",
  className = "",
}: SkeuoToggleProps) {
  return (
    <div
      className={`inline-flex items-center p-1.5 rounded-2xl bg-[#090d16] border border-white/10 shadow-[inset_0_3px_8px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)] select-none ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
          checked
            ? "bg-gradient-to-b from-[#1e293b] via-[#111827] to-[#0f172a] text-emerald-400 shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_15px_rgba(16,185,129,0.25)] border border-emerald-500/40"
            : "text-slate-500 hover:text-slate-300 bg-transparent border border-transparent"
        }`}
      >
        {/* Skeuomorphic LED Indicator */}
        <span
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            checked
              ? "bg-emerald-400 shadow-[0_0_8px_#34d399,0_0_15px_#10b981]"
              : "bg-slate-700 shadow-inner"
          }`}
        />
        <span>{activeText}</span>
      </button>

      <button
        type="button"
        onClick={() => onChange(false)}
        className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
          !checked
            ? "bg-gradient-to-b from-[#1e293b] via-[#111827] to-[#0f172a] text-rose-400 shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2),0_0_15px_rgba(244,63,94,0.25)] border border-rose-500/40"
            : "text-slate-500 hover:text-slate-300 bg-transparent border border-transparent"
        }`}
      >
        {/* Skeuomorphic LED Indicator */}
        <span
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            !checked
              ? "bg-rose-500 shadow-[0_0_8px_#f43f5e,0_0_15px_#e11d48]"
              : "bg-slate-700 shadow-inner"
          }`}
        />
        <span>{inactiveText}</span>
      </button>
    </div>
  );
}

interface SkeuoStatusBadgeProps {
  checked: boolean;
  onToggle: () => void;
  activeText?: string;
  inactiveText?: string;
  disabled?: boolean;
}

/**
 * Skeuomorphism 2.0 LED Status Toggle Button for Table Lists
 */
export function SkeuoStatusBadge({
  checked,
  onToggle,
  activeText = "Aktif",
  inactiveText = "Nonaktif",
  disabled = false,
}: SkeuoStatusBadgeProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 select-none ${
        checked
          ? "bg-gradient-to-b from-[#14231e] via-[#0b1613] to-[#08100d] text-emerald-400 border border-emerald-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(52,211,153,0.2),0_0_12px_rgba(16,185,129,0.15)] hover:border-emerald-500/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_15px_rgba(16,185,129,0.3)]"
          : "bg-gradient-to-b from-[#24171b] via-[#160d10] to-[#0f080a] text-rose-400 border border-rose-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(244,63,94,0.2),0_0_12px_rgba(244,63,94,0.15)] hover:border-rose-500/50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.6),0_0_15px_rgba(244,63,94,0.3)]"
      }`}
    >
      {/* 3D Glowing LED Bulbs */}
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        {checked && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            checked
              ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
              : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
          }`}
        />
      </span>
      <span>{checked ? activeText : inactiveText}</span>
    </button>
  );
}
