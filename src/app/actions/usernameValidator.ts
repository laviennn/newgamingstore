"use server";

import crypto from "crypto";
import { createServiceClient } from "@/utils/supabase/service";

export interface ValidationResult {
  success: boolean;
  username?: string;
  message?: string;
}

export interface ValidationProviderStrategy {
  id: string;
  name: string;
  resolveGameCode(rawGameCode: string, overrides?: Record<string, string>): string;
  validate(
    uid: string,
    serverId: string | undefined,
    rawGameCode: string,
    overrides?: Record<string, string>
  ): Promise<ValidationResult>;
}

// 1. Canonical Game Code Mapping Dictionary
const CANONICAL_GAME_MAP: Record<string, { vipReseller: string; kokinpay: string; rapidApi: string }> = {
  "mobile-legends": { vipReseller: "mobile-legends", kokinpay: "mobile-legends", rapidApi: "cek_game_ml" },
  "mobile-legend": { vipReseller: "mobile-legends", kokinpay: "mobile-legends", rapidApi: "cek_game_ml" },
  "cek_game_ml": { vipReseller: "mobile-legends", kokinpay: "mobile-legends", rapidApi: "cek_game_ml" },
  "cek-game-ml": { vipReseller: "mobile-legends", kokinpay: "mobile-legends", rapidApi: "cek_game_ml" },
  "mlbb": { vipReseller: "mobile-legends", kokinpay: "mobile-legends", rapidApi: "cek_game_ml" },
  "ml": { vipReseller: "mobile-legends", kokinpay: "mobile-legends", rapidApi: "cek_game_ml" },

  "genshin-impact": { vipReseller: "genshin-impact", kokinpay: "genshin-impact", rapidApi: "test_game_genshin" },
  "genshin": { vipReseller: "genshin-impact", kokinpay: "genshin-impact", rapidApi: "test_game_genshin" },
  "genshin_impact": { vipReseller: "genshin-impact", kokinpay: "genshin-impact", rapidApi: "test_game_genshin" },

  "free-fire": { vipReseller: "free-fire", kokinpay: "free-fire", rapidApi: "free-fire" },
  "free-fire-max": { vipReseller: "free-fire", kokinpay: "free-fire-max", rapidApi: "free-fire" },
  "freefire": { vipReseller: "free-fire", kokinpay: "free-fire", rapidApi: "free-fire" },
  "ff": { vipReseller: "free-fire", kokinpay: "free-fire", rapidApi: "free-fire" },

  "pubg-mobile": { vipReseller: "pubgm", kokinpay: "pubg-mobile", rapidApi: "cekpubgmobile" },
  "pubgm": { vipReseller: "pubgm", kokinpay: "pubg-mobile", rapidApi: "cekpubgmobile" },
  "pubg": { vipReseller: "pubgm", kokinpay: "pubg-mobile", rapidApi: "cekpubgmobile" },
  "pubgm-global": { vipReseller: "pubgm", kokinpay: "pubg-mobile", rapidApi: "cekpubgmobile" },

  "valorant": { vipReseller: "valorant", kokinpay: "valorant", rapidApi: "valorant" },
  "val": { vipReseller: "valorant", kokinpay: "valorant", rapidApi: "valorant" },

  "point-blank": { vipReseller: "pointblank", kokinpay: "point-blank", rapidApi: "point-blank" },
  "pointblank": { vipReseller: "pointblank", kokinpay: "point-blank", rapidApi: "point-blank" },
  "pb": { vipReseller: "pointblank", kokinpay: "point-blank", rapidApi: "point-blank" },

  "cod-mobile": { vipReseller: "codm", kokinpay: "call-of-duty-mobile", rapidApi: "cod-mobile" },
  "call-of-duty-mobile": { vipReseller: "codm", kokinpay: "call-of-duty-mobile", rapidApi: "cod-mobile" },
  "call-of-duty": { vipReseller: "codm", kokinpay: "call-of-duty-mobile", rapidApi: "cod-mobile" },
  "codm": { vipReseller: "codm", kokinpay: "call-of-duty-mobile", rapidApi: "cod-mobile" },

  "honkai-star-rail": { vipReseller: "honkai-star-rail", kokinpay: "honkai-star-rail", rapidApi: "honkai-star-rail" },
  "hsr": { vipReseller: "honkai-star-rail", kokinpay: "honkai-star-rail", rapidApi: "honkai-star-rail" },

  "honor-of-kings": { vipReseller: "honor-of-kings", kokinpay: "honor-of-kings", rapidApi: "hokid" },
  "hok": { vipReseller: "honor-of-kings", kokinpay: "honor-of-kings", rapidApi: "hokid" },
  "hokid": { vipReseller: "honor-of-kings", kokinpay: "honor-of-kings", rapidApi: "hokid" },
  
  "league-of-legends-wild-rift": { vipReseller: "league-of-legends-wild-rift", kokinpay: "league-of-legends-wild-rift", rapidApi: "league-of-legends-wild-rift" },
  "wild-rift": { vipReseller: "league-of-legends-wild-rift", kokinpay: "league-of-legends-wild-rift", rapidApi: "league-of-legends-wild-rift" },
  
  "arena-of-valor": { vipReseller: "arena-of-valor", kokinpay: "arena-of-valor", rapidApi: "arena-of-valor" },
  "aov": { vipReseller: "arena-of-valor", kokinpay: "arena-of-valor", rapidApi: "arena-of-valor" },
};

function normalizeServerId(gameCode: string, serverId?: string): string | undefined {
  if (!serverId) return serverId;
  const s = serverId.trim().toLowerCase();

  if (gameCode.includes("genshin")) {
    if (s === "os_asia") return "asia";
    if (s === "os_usa") return "america";
    if (s === "os_euro") return "europe";
    if (s === "os_cht") return "tw_hk_mo";
  }

  return serverId;
}

function extractUsernameString(raw: any): string | null {
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return String(raw);
  if (typeof raw === 'object') {
    if (typeof raw.username === 'string' && raw.username) return raw.username;
    if (typeof raw.nickname === 'string' && raw.nickname) return raw.nickname;
    if (typeof raw.name === 'string' && raw.name) return raw.name;
    if (typeof raw.userName === 'string' && raw.userName) return raw.userName;
    if (typeof raw.nick_name === 'string' && raw.nick_name) return raw.nick_name;
    if (typeof raw.user_name === 'string' && raw.user_name) return raw.user_name;
    if (typeof raw.data === 'string' && raw.data) return raw.data;
    if (typeof raw.data === 'object' && raw.data !== null) return extractUsernameString(raw.data);
    if (typeof raw.result === 'string' && raw.result) return raw.result;
  }
  return null;
}

function extractCountryString(raw: any): string | null {
  if (!raw) return null;
  if (typeof raw === 'object') {
    if (typeof raw.country === 'string' && raw.country.trim()) return raw.country.trim();
    if (typeof raw.region === 'string' && raw.region.trim()) return raw.region.trim();
    if (typeof raw.country_code === 'string' && raw.country_code.trim()) return raw.country_code.trim();
    if (typeof raw.user_country === 'string' && raw.user_country.trim()) return raw.user_country.trim();
    if (typeof raw.data === 'object' && raw.data !== null) return extractCountryString(raw.data);
  }
  return null;
}

async function saveValidationLog(logData: {
  gameCode: string;
  userId: string;
  serverId?: string;
  provider: string;
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  resultUsername?: string | null;
  message?: string | null;
  executionTimeMs: number;
  ratelimitLimit?: number | null;
  ratelimitRemaining?: number | null;
}) {
  try {
    const supabase = createServiceClient();
    await supabase.from('api_validation_logs').insert({
      game_code: logData.gameCode,
      user_id: logData.userId,
      server_id: logData.serverId || null,
      provider: logData.provider,
      status: logData.status,
      result_username: logData.resultUsername || null,
      message: logData.message || null,
      execution_time_ms: logData.executionTimeMs,
      ratelimit_limit: logData.ratelimitLimit ?? null,
      ratelimit_remaining: logData.ratelimitRemaining ?? null,
    });
  } catch (err) {
    console.error("Failed to insert api_validation_log:", err);
  }
}

// ─── VIP Reseller Strategy Adapter ──────────────────────────────────────────
const vipResellerStrategy: ValidationProviderStrategy = {
  id: 'vip-reseller',
  name: 'VIP Reseller',
  resolveGameCode(rawGameCode: string, overrides?: Record<string, string>): string {
    if (overrides?.['vip-reseller']) return overrides['vip-reseller'];
    const key = rawGameCode.toLowerCase().trim();
    if (CANONICAL_GAME_MAP[key]?.vipReseller) {
      return CANONICAL_GAME_MAP[key].vipReseller;
    }
    // Heuristic: strip 'cek_game_' and replace '_' with '-'
    let cleaned = key.replace(/^cek_game_/, '').replace(/_/g, '-');
    if (cleaned === 'ml') return 'mobile-legends';
    return cleaned || rawGameCode;
  },
  async validate(uid: string, serverId: string | undefined, rawGameCode: string, overrides?: Record<string, string>): Promise<ValidationResult> {
    const startTime = Date.now();
    const targetCode = this.resolveGameCode(rawGameCode, overrides);
    try {
      const apiId = process.env.VIP_RESELLER_API_ID;
      const apiKey = process.env.VIP_RESELLER_API_KEY;

      if (!apiId || !apiKey) {
        const msg = "VIP Reseller API Config missing in .env";
        await saveValidationLog({
          gameCode: targetCode,
          userId: uid,
          serverId,
          provider: this.id,
          status: 'FAILED',
          message: msg,
          executionTimeMs: Date.now() - startTime,
        });
        return { success: false, message: msg };
      }

      const sign = crypto.createHash('md5').update(apiId + apiKey).digest('hex');
      const targetServer = normalizeServerId(targetCode, serverId);

      const formData = new URLSearchParams();
      formData.append('key', apiKey);
      formData.append('sign', sign);
      formData.append('type', 'get-nickname');
      formData.append('code', targetCode);
      formData.append('target', uid);
      if (targetServer) {
        formData.append('additional_target', targetServer);
      }

      const response = await fetch('https://vip-reseller.co.id/api/game-feature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString(),
        signal: AbortSignal.timeout(7000),
      });

      const executionTimeMs = Date.now() - startTime;

      if (!response.ok) {
        const msg = `VIP Reseller HTTP Error: ${response.status}`;
        await saveValidationLog({
          gameCode: targetCode,
          userId: uid,
          serverId,
          provider: this.id,
          status: 'FAILED',
          message: msg,
          executionTimeMs,
        });
        return { success: false, message: msg };
      }

      const data = await response.json();
      let username = extractUsernameString(data.data) || extractUsernameString(data);
      const country = extractCountryString(data.data) || extractCountryString(data);
      if (username && country && !username.toLowerCase().includes(country.toLowerCase())) {
        username = `${username} (${country})`;
      }

      if (data.result && username) {
        await saveValidationLog({
          gameCode: targetCode,
          userId: uid,
          serverId,
          provider: this.id,
          status: 'SUCCESS',
          resultUsername: username,
          executionTimeMs,
        });
        return { success: true, username };
      } else {
        const msg = data.message || "Username tidak ditemukan";
        await saveValidationLog({
          gameCode: targetCode,
          userId: uid,
          serverId,
          provider: this.id,
          status: 'FAILED',
          message: msg,
          executionTimeMs,
        });
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const executionTimeMs = Date.now() - startTime;
      const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError' || err?.code === 23 || err?.message?.includes('timeout') || err?.message?.includes('aborted');
      const msg = isTimeout 
        ? "Koneksi ke VIP Reseller waktu habis (Timeout). Silakan coba lagi."
        : err?.message || "Terjadi kesalahan koneksi ke VIP Reseller";

      await saveValidationLog({
        gameCode: targetCode,
        userId: uid,
        serverId,
        provider: this.id,
        status: isTimeout ? 'TIMEOUT' : 'FAILED',
        message: msg,
        executionTimeMs,
      });

      return { success: false, message: msg };
    }
  }
};

// ─── RapidAPI Strategy Adapter ──────────────────────────────────────────────
const rapidApiStrategy: ValidationProviderStrategy = {
  id: 'rapidapi',
  name: 'RapidAPI',
  resolveGameCode(rawGameCode: string, overrides?: Record<string, string>): string {
    if (overrides?.['rapidapi']) return overrides['rapidapi'];
    const key = rawGameCode.toLowerCase().trim();
    if (CANONICAL_GAME_MAP[key]?.rapidApi) {
      return CANONICAL_GAME_MAP[key].rapidApi;
    }
    // Heuristic: if contains mobile-legend or ml, use 'cek_game_ml'
    if (key.includes('mobile-legend') || key.includes('mlbb') || key === 'ml') {
      return 'cek_game_ml';
    }
    return rawGameCode;
  },
  async validate(uid: string, serverId: string | undefined, rawGameCode: string, overrides?: Record<string, string>): Promise<ValidationResult> {
    const startTime = Date.now();
    const targetCode = this.resolveGameCode(rawGameCode, overrides);
    try {
      const apiKey = process.env.RAPIDAPI_KEY;
      if (!apiKey) {
        const msg = "RapidAPI Key missing in .env";
        await saveValidationLog({
          gameCode: targetCode,
          userId: uid,
          serverId,
          provider: this.id,
          status: 'FAILED',
          message: msg,
          executionTimeMs: Date.now() - startTime,
        });
        return { success: false, message: msg };
      }

      const targetServer = normalizeServerId(targetCode, serverId);

      const apiPrefix = targetCode === 'hokid' ? 'rapid-api' : 'rapid_api';
      let url = `https://check-id-game.p.rapidapi.com/api/${apiPrefix}/${targetCode}/${uid}`;
      if (targetServer) {
        url += `/${targetServer}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'check-id-game.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(7000),
      });

      const executionTimeMs = Date.now() - startTime;

      // Parse rate limit headers
      const limitHeader = response.headers.get('x-ratelimit-requests-limit');
      const remainingHeader = response.headers.get('x-ratelimit-requests-remaining');
      const ratelimitLimit = limitHeader ? parseInt(limitHeader, 10) : null;
      const ratelimitRemaining = remainingHeader ? parseInt(remainingHeader, 10) : null;

      if (!response.ok) {
        const msg = `RapidAPI HTTP Error: ${response.status}`;
        await saveValidationLog({
          gameCode: targetCode,
          userId: uid,
          serverId,
          provider: this.id,
          status: 'FAILED',
          message: msg,
          executionTimeMs,
          ratelimitLimit,
          ratelimitRemaining,
        });
        return { success: false, message: msg };
      }

      const data = await response.json();
      let username = extractUsernameString(data);
      const country = extractCountryString(data);
      if (username && country && !username.toLowerCase().includes(country.toLowerCase())) {
        username = `${username} (${country})`;
      }

      if (username) {
        await saveValidationLog({
          gameCode: targetCode,
          userId: uid,
          serverId,
          provider: this.id,
          status: 'SUCCESS',
          resultUsername: username,
          executionTimeMs,
          ratelimitLimit,
          ratelimitRemaining,
        });
        return { success: true, username };
      } else {
        const msg = data.message || data.error || "Username tidak ditemukan di RapidAPI";
        await saveValidationLog({
          gameCode: targetCode,
          userId: uid,
          serverId,
          provider: this.id,
          status: 'FAILED',
          message: msg,
          executionTimeMs,
          ratelimitLimit,
          ratelimitRemaining,
        });
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const executionTimeMs = Date.now() - startTime;
      const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError' || err?.code === 23 || err?.message?.includes('timeout') || err?.message?.includes('aborted');
      const msg = isTimeout
        ? "Koneksi ke RapidAPI waktu habis (Timeout). Silakan coba lagi."
        : err?.message || "Terjadi kesalahan koneksi ke RapidAPI";

      await saveValidationLog({
        gameCode: targetCode,
        userId: uid,
        serverId,
        provider: this.id,
        status: isTimeout ? 'TIMEOUT' : 'FAILED',
        message: msg,
        executionTimeMs,
      });

      return { success: false, message: msg };
    }
  }
};

// ─── KokinPay Strategy ───────────────────────────────────────────────────────
const kokinPayStrategy: ValidationProviderStrategy = {
  id: 'kokinpay',
  name: 'KokinPay',

  resolveGameCode(rawGameCode: string, overrides?: Record<string, string>): string {
    if (overrides && overrides['kokinpay']) return overrides['kokinpay'];
    const s = rawGameCode.toLowerCase().trim();
    if (CANONICAL_GAME_MAP[s]) return CANONICAL_GAME_MAP[s].kokinpay;
    return s;
  },

  async validate(uid: string, serverId: string | undefined, rawGameCode: string, overrides?: Record<string, string>): Promise<ValidationResult> {
    const apiKey = process.env.KOKINPAY_API_KEY;
    if (!apiKey) {
      return { success: false, message: "KOKINPAY_API_KEY belum dikonfigurasi di server." };
    }

    const targetCode = this.resolveGameCode(rawGameCode, overrides);
    const targetServer = normalizeServerId(targetCode, serverId);
    
    const body: Record<string, string> = {
      api_key: apiKey,
      id: uid,
      game_code: targetCode,
    };
    if (targetServer) {
      body.server = targetServer;
    }

    const isMLBB = targetCode === 'mobile-legends';
    const endpoint = isMLBB ? 'https://api.kokinpay.com/v1/check-region' : 'https://api.kokinpay.com/v1/check-nickname';
    
    if (isMLBB) {
      delete body.game_code;
    }

    const startTime = Date.now();
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(7000),
      });

      const executionTimeMs = Date.now() - startTime;
      const data = await response.json();

      if (!response.ok || data.status === false) {
        const msg = data.message || `Provider KokinPay menolak request (HTTP ${response.status})`;
        await saveValidationLog({
          gameCode: targetCode,
          userId: uid,
          serverId,
          provider: this.id,
          status: 'FAILED',
          message: msg,
          executionTimeMs,
        });
        return { success: false, message: msg };
      }

      let username = extractUsernameString(data.data?.nickname || data.nickname);
      const region = data.data?.region || data.region;
      
      const country = region || extractCountryString(data);
      if (username && country && !username.toLowerCase().includes(country.toLowerCase())) {
        username = `${username} (${country})`;
      }

      if (username) {
        await saveValidationLog({
          gameCode: targetCode,
          userId: uid,
          serverId,
          provider: this.id,
          status: 'SUCCESS',
          resultUsername: username,
          executionTimeMs,
        });
        return { success: true, username };
      }

      const emptyMsg = "Response KokinPay tidak memiliki nickname.";
      await saveValidationLog({
        gameCode: targetCode,
        userId: uid,
        serverId,
        provider: this.id,
        status: 'FAILED',
        message: emptyMsg,
        executionTimeMs,
      });
      return { success: false, message: emptyMsg };

    } catch (err: any) {
      const executionTimeMs = Date.now() - startTime;
      const msg = err?.name === 'TimeoutError' || err?.code === 23
        ? "Timeout saat menghubungi provider KokinPay."
        : (err?.message || "Koneksi ke provider KokinPay gagal.");

      await saveValidationLog({
        gameCode: targetCode,
        userId: uid,
        serverId,
        provider: this.id,
        status: 'FAILED',
        message: msg,
        executionTimeMs,
      });

      return { success: false, message: msg };
    }
  }
};

// ─── Provider Registry ───────────────────────────────────────────────────────
const PROVIDER_REGISTRY: Record<string, ValidationProviderStrategy> = {
  'vip-reseller': vipResellerStrategy,
  'kokinpay': kokinPayStrategy,
  'rapidapi': rapidApiStrategy,
};

// Main Entry Point
export async function checkUsername(
  uid: string,
  serverId: string | undefined,
  gameCode: string,
  provider: string
): Promise<ValidationResult> {
  try {
    // Optionally fetch DB provider_code_overrides if gameCode matches a game in DB
    let overrides: Record<string, string> | undefined = undefined;
    try {
      const supabase = createServiceClient();
      const { data: game } = await supabase
        .from('games')
        .select('provider_code_overrides')
        .or(`slug.eq.${gameCode},validator_game_code.eq.${gameCode}`)
        .maybeSingle();

      if (game?.provider_code_overrides && typeof game.provider_code_overrides === 'object') {
        overrides = game.provider_code_overrides as Record<string, string>;
      }
    } catch {
      // Ignore DB fetch error and fallback to smart canonical normalizer
    }

    if (provider === 'auto') {
      let providersToTry = ['vip-reseller', 'kokinpay', 'rapidapi'];
      
      const canonical = CANONICAL_GAME_MAP[gameCode.toLowerCase().trim()];
      const targetVipCode = canonical ? canonical.vipReseller : gameCode;
      
      if (targetVipCode === 'mobile-legends') {
        // Khusus Mobile Legends, jadikan KokinPay sebagai provider pertama
        providersToTry = ['kokinpay', 'vip-reseller', 'rapidapi'];
      }

      let lastResult: ValidationResult = { success: false, message: "Username tidak ditemukan." };

      for (const pId of providersToTry) {
        const strategy = PROVIDER_REGISTRY[pId];
        if (!strategy) continue;

        const res = await strategy.validate(uid, serverId, gameCode, overrides);
        if (res.success) return res;
      }

      return { success: false, message: "Username tidak ditemukan atau layanan pengecekan sedang sibuk. Silakan periksa kembali User ID/Zone ID Anda." };
    }

    const strategy = PROVIDER_REGISTRY[provider];
    if (!strategy) {
      return { success: false, message: `Provider '${provider}' tidak terdaftar pada sistem.` };
    }

    const res = await strategy.validate(uid, serverId, gameCode, overrides);
    if (!res.success) {
      return { success: false, message: "Username tidak ditemukan atau layanan pengecekan sedang sibuk. Silakan periksa kembali User ID/Zone ID Anda." };
    }
    return res;
  } catch (err: any) {
    return { success: false, message: "Terjadi kesalahan pada layanan pengecekan. Silakan coba beberapa saat lagi." };
  }
}


