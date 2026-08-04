"use server";

import crypto from "crypto";

export interface ValidationResult {
  success: boolean;
  username?: string;
  message?: string;
}

// Map kode game standar -> kode spesifik per provider API
const GAME_CODE_MAP: Record<string, { vipReseller?: string; rapidApi?: string }> = {
  "genshin-impact": { vipReseller: "genshin-impact", rapidApi: "genshin" },
  "genshin": { vipReseller: "genshin-impact", rapidApi: "genshin" },
  "mobile-legends": { vipReseller: "mobile-legends", rapidApi: "mobile-legends" },
  "mobile-legend": { vipReseller: "mobile-legends", rapidApi: "mobile-legends" },
  "free-fire": { vipReseller: "free-fire", rapidApi: "free-fire" },
  "free-fire-max": { vipReseller: "free-fire", rapidApi: "free-fire" },
  "pubg-mobile": { vipReseller: "pubgm", rapidApi: "pubgm-global" },
  "pubgm": { vipReseller: "pubgm", rapidApi: "pubgm-global" },
  "pubg": { vipReseller: "pubgm", rapidApi: "pubgm-global" },
  "pubgm-global": { vipReseller: "pubgm", rapidApi: "pubgm-global" },
  "valorant": { vipReseller: "valorant", rapidApi: "valorant" },
  "point-blank": { vipReseller: "pointblank", rapidApi: "point-blank" },
  "pointblank": { vipReseller: "pointblank", rapidApi: "point-blank" },
  "cod-mobile": { vipReseller: "codm", rapidApi: "cod-mobile" },
  "call-of-duty-mobile": { vipReseller: "codm", rapidApi: "cod-mobile" },
  "call-of-duty": { vipReseller: "codm", rapidApi: "cod-mobile" },
  "codm": { vipReseller: "codm", rapidApi: "cod-mobile" },
  "honkai-star-rail": { vipReseller: "honkai-star-rail", rapidApi: "honkai-star-rail" },
};

function getVipResellerCode(rawCode: string): string {
  const normalized = rawCode.toLowerCase().trim();
  return GAME_CODE_MAP[normalized]?.vipReseller || rawCode;
}

function getRapidApiCode(rawCode: string): string {
  const normalized = rawCode.toLowerCase().trim();
  return GAME_CODE_MAP[normalized]?.rapidApi || rawCode;
}

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

export async function checkUsername(
  uid: string,
  serverId: string | undefined,
  gameCode: string,
  provider: string
): Promise<ValidationResult> {
  if (provider === 'auto') {
    // Coba VIP Reseller dulu, jika gagal coba RapidAPI
    const res1 = await validateVipReseller(uid, serverId, gameCode);
    if (res1.success) return res1;

    const res2 = await validateRapidApi(uid, serverId, gameCode);
    if (res2.success) return res2;

    return { success: false, message: "Username tidak ditemukan." };
  } else if (provider === 'vip-reseller') {
    return await validateVipReseller(uid, serverId, gameCode);
  } else if (provider === 'rapidapi') {
    return await validateRapidApi(uid, serverId, gameCode);
  }

  return { success: false, message: "Provider validasi tidak dikenal." };
}

function extractUsernameString(raw: any): string | null {
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return String(raw);
  if (typeof raw === 'object') {
    if (typeof raw.username === 'string') return raw.username;
    if (typeof raw.name === 'string') return raw.name;
    if (typeof raw.nickname === 'string') return raw.nickname;
    if (typeof raw.userName === 'string') return raw.userName;
    if (typeof raw.data === 'string') return raw.data;
    if (typeof raw.data === 'object' && raw.data !== null) return extractUsernameString(raw.data);
  }
  return null;
}

async function validateVipReseller(uid: string, serverId: string | undefined, gameCode: string): Promise<ValidationResult> {
  try {
    const apiId = process.env.VIP_RESELLER_API_ID;
    const apiKey = process.env.VIP_RESELLER_API_KEY;

    if (!apiId || !apiKey) {
      return { success: false, message: "VIP Reseller API Config missing in .env" };
    }

    const sign = crypto.createHash('md5').update(apiId + apiKey).digest('hex');

    const targetCode = getVipResellerCode(gameCode);
    const targetServer = normalizeServerId(gameCode, serverId);

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
      body: formData.toString()
    });

    const data = await response.json();
    const username = extractUsernameString(data.data) || extractUsernameString(data);
    if (data.result && username) {
      return { success: true, username };
    } else {
      return { success: false, message: data.message || "Username tidak ditemukan" };
    }
  } catch (err: any) {
    return { success: false, message: err.message || "Terjadi kesalahan koneksi ke VIP Reseller" };
  }
}

async function validateRapidApi(uid: string, serverId: string | undefined, gameCode: string): Promise<ValidationResult> {
  try {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return { success: false, message: "RapidAPI Key missing in .env" };
    }

    const targetCode = getRapidApiCode(gameCode);
    const targetServer = normalizeServerId(gameCode, serverId);

    let url = `https://id-game-checker.p.rapidapi.com/${targetCode}/${uid}`;
    if (targetServer) {
      url += `/${targetServer}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'id-game-checker.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    const username = extractUsernameString(data);
    if (username) {
      return { success: true, username };
    } else {
      return { success: false, message: data.message || data.error || "Username tidak ditemukan di RapidAPI" };
    }
  } catch (err: any) {
    return { success: false, message: err.message || "Terjadi kesalahan koneksi ke RapidAPI" };
  }
}
