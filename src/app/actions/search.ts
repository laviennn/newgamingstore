"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function searchGames(query: string, domainOrTenantId?: string) {
  if (!query || query.trim() === "") {
    return { success: true, games: [] };
  }

  try {
    const supabase = await createClient();

    // 1. Resolve Tenant ID
    let tenantId: string | null = null;

    if (domainOrTenantId) {
      // Check if domainOrTenantId is a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(domainOrTenantId);
      if (isUUID) {
        tenantId = domainOrTenantId;
      } else {
        const targetDomain = domainOrTenantId === "demo.localhost" ? "localhost" : domainOrTenantId;
        const { data: tenant } = await supabase
          .from("tenants")
          .select("id")
          .or(`domain.eq.${targetDomain},admin_domain.eq.${targetDomain}`)
          .maybeSingle();

        if (tenant?.id) {
          tenantId = tenant.id;
        }
      }
    }

    // 2. Fallback to Hostname detection from Request Headers
    if (!tenantId) {
      const headerList = await headers();
      const rawHost = headerList.get("host") || headerList.get("x-forwarded-host") || "";
      const domainWithoutPort = rawHost.split(":")[0];

      if (domainWithoutPort) {
        const targetDomain = domainWithoutPort === "demo.localhost" ? "localhost" : domainWithoutPort;
        const { data: matchedTenant } = await supabase
          .from("tenants")
          .select("id")
          .or(`domain.eq.${targetDomain},admin_domain.eq.${targetDomain}`)
          .maybeSingle();

        if (matchedTenant?.id) {
          tenantId = matchedTenant.id;
        }
      }
    }

    // 3. Fallback to default tenant (for dev localhost)
    if (!tenantId) {
      const { data: firstTenant } = await supabase
        .from("tenants")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      tenantId = firstTenant?.id || null;
    }

    if (!tenantId) {
      return { success: true, games: [] };
    }

    // 4. Query games strictly isolated by tenant_id
    const { data, error } = await supabase
      .from("games")
      .select("id, name, slug, image_url")
      .eq("tenant_id", tenantId)
      .ilike("name", `%${query.trim()}%`)
      .order("name", { ascending: true })
      .limit(8);

    if (error) {
      console.error("Search error:", error);
      return { success: false, games: [] };
    }

    return { success: true, games: data || [] };
  } catch (err) {
    console.error("Search exception:", err);
    return { success: false, games: [] };
  }
}
