export type ThemePreset = "default" | "emerald";

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
}

import { Language } from "./dictionary";

export interface ThemeConfig {
  themePreset?: ThemePreset;
  colors?: Partial<ThemeColors>;
  language?: Language;
  currency?: "IDR" | "MYR";
}

export const THEME_PRESETS: Record<ThemePreset, ThemeColors> = {
  default: {
    primary: "#2563eb",
    background: "#0a0f1d",
    card: "#1c2333",
    text: "#ffffff",
  },
  emerald: {
    primary: "#10b981",
    background: "#06120e",
    card: "#0e221b",
    text: "#ffffff",
  },
};

// Helper to convert hex to RGB string (e.g., "#2563eb" -> "37 99 235")
// Useful if we want to use rgba() with CSS variables
export function hexToRgbString(hex: string): string {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) return "0 0 0";
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `${r} ${g} ${b}`;
}

import { hexToHsl } from "./utils";

export function getThemeConfigOrDefault(tenantThemeConfig?: ThemeConfig): { preset: ThemePreset, colors: ThemeColors, language: Language, currency: "IDR" | "MYR" } {
  const preset: ThemePreset = tenantThemeConfig?.themePreset || "default";
  const defaultColors = THEME_PRESETS[preset] || THEME_PRESETS.default;
  const language = tenantThemeConfig?.language || "id";
  const currency = tenantThemeConfig?.currency || (language === "ms" ? "MYR" : "IDR");
  
  const colors: ThemeColors = {
    ...defaultColors,
    ...tenantThemeConfig?.colors,
  };
  
  return { preset, colors, language, currency };
}

export function generateThemeCssVariables(themeConfig?: ThemeConfig): string {
  const { colors } = getThemeConfigOrDefault(themeConfig);
  
  return `
    :root, .dark {
      --primary: ${hexToHsl(colors.primary)};
      --primary-hex: ${colors.primary};
      --ring: ${hexToHsl(colors.primary)};
      
      --background: ${hexToHsl(colors.background)};
      
      --card: ${hexToHsl(colors.card)};
      --popover: ${hexToHsl(colors.card)};
      --muted: ${hexToHsl(colors.card)};
      
      --foreground: ${hexToHsl(colors.text)};
      --card-foreground: ${hexToHsl(colors.text)};
      --popover-foreground: ${hexToHsl(colors.text)};
      
      --accent-glow: rgba(${hexToRgbString(colors.primary)}, 0.15);
    }
  `;
}
