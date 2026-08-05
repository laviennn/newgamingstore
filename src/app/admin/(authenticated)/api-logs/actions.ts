"use server";

import { createClient } from "@/utils/supabase/server";

export interface ApiLogFilters {
  page?: number;
  limit?: number;
  provider?: string;
  status?: string;
  search?: string;
}

export async function getApiValidationLogs(filters: ApiLogFilters = {}) {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    let query = supabase
      .from("api_validation_logs")
      .select("*", { count: "exact" });

    if (filters.provider && filters.provider !== "ALL") {
      query = query.eq("provider", filters.provider);
    }

    if (filters.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status);
    }

    if (filters.search && filters.search.trim() !== "") {
      const s = `%${filters.search.trim()}%`;
      query = query.or(`user_id.ilike.${s},game_code.ilike.${s},result_username.ilike.${s}`);
    }

    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching api_validation_logs:", error);
      return { success: false, logs: [], total: 0 };
    }

    return {
      success: true,
      logs: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (err: any) {
    console.error("Exception in getApiValidationLogs:", err);
    return { success: false, logs: [], total: 0, error: err.message };
  }
}

export async function getApiValidationStats() {
  try {
    const supabase = await createClient();

    // Fetch total logs count & breakdown
    const { data: logs, error } = await supabase
      .from("api_validation_logs")
      .select("provider, status, execution_time_ms, ratelimit_limit, ratelimit_remaining, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Error fetching stats:", error);
      return {
        totalCalls: 0,
        vipResellerHits: 0,
        kokinpayHits: 0,
        rapidApiHits: 0,
        vipSuccess: 0,
        kokinpaySuccess: 0,
        rapidSuccess: 0,
        avgLatencyMs: 0,
        rapidLimit: null,
        rapidRemaining: null,
      };
    }

    let vipHits = 0;
    let kokinpayHits = 0;
    let rapidHits = 0;
    let vipSuccess = 0;
    let kokinpaySuccess = 0;
    let rapidSuccess = 0;
    let totalLatency = 0;
    let rapidLimit: number | null = null;
    let rapidRemaining: number | null = null;

    for (const log of logs || []) {
      if (log.execution_time_ms) {
        totalLatency += log.execution_time_ms;
      }

      if (log.provider === "vip-reseller") {
        vipHits++;
        if (log.status === "SUCCESS") vipSuccess++;
      } else if (log.provider === "kokinpay") {
        kokinpayHits++;
        if (log.status === "SUCCESS") kokinpaySuccess++;
      } else if (log.provider === "rapidapi") {
        rapidHits++;
        if (log.status === "SUCCESS") rapidSuccess++;

        if (rapidRemaining === null && typeof log.ratelimit_remaining === "number") {
          rapidRemaining = log.ratelimit_remaining;
          rapidLimit = log.ratelimit_limit ?? null;
        }
      }
    }

    const totalCalls = logs?.length || 0;
    const avgLatencyMs = totalCalls > 0 ? Math.round(totalLatency / totalCalls) : 0;

    return {
      totalCalls,
      vipResellerHits: vipHits,
      kokinpayHits,
      rapidApiHits: rapidHits,
      vipSuccess,
      kokinpaySuccess,
      rapidSuccess,
      avgLatencyMs,
      rapidLimit,
      rapidRemaining,
    };
  } catch (err: any) {
    console.error("Exception in getApiValidationStats:", err);
    return {
      totalCalls: 0,
      vipResellerHits: 0,
      kokinpayHits: 0,
      rapidApiHits: 0,
      vipSuccess: 0,
      kokinpaySuccess: 0,
      rapidSuccess: 0,
      avgLatencyMs: 0,
      rapidLimit: null,
      rapidRemaining: null,
    };
  }
}
