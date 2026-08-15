import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getAdminSession, getActiveAdminTenantId } from "@/app/admin/actions";

export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "DUPLICATE"
  | "APPROVE"
  | "REJECT"
  | "TOGGLE_STATUS"
  | "REORDER";

export type ActivityEntity =
  | "game"
  | "category"
  | "product"
  | "order"
  | "payment_channel"
  | "contact_settings"
  | "role"
  | "operator"
  | "theme";

export interface LogActivityParams {
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string | null;
  description: string;
  payload?: Record<string, any> | null;
  tenantId?: string | null;
  adminId?: string | null;
  adminEmail?: string | null;
  adminRole?: string | null;
}

export interface FieldDiff {
  field: string;
  from: any;
  to: any;
}

/**
 * Calculates differences between two objects for audit payload logging.
 */
export function calculateDiffs(
  oldObj: Record<string, any> | null | undefined,
  newObj: Record<string, any> | null | undefined,
  fieldsToCompare?: string[]
): { previous: Record<string, any>; updated: Record<string, any>; diffs: FieldDiff[] } {
  const previous: Record<string, any> = {};
  const updated: Record<string, any> = {};
  const diffs: FieldDiff[] = [];

  if (!oldObj || !newObj) {
    return {
      previous: oldObj || {},
      updated: newObj || {},
      diffs: [],
    };
  }

  const keys = fieldsToCompare || Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

  for (const key of keys) {
    const fromVal = oldObj[key];
    const toVal = newObj[key];

    // Standardize comparison for strings, numbers, objects
    const fromStr = typeof fromVal === "object" ? JSON.stringify(fromVal) : String(fromVal ?? "");
    const toStr = typeof toVal === "object" ? JSON.stringify(toVal) : String(toVal ?? "");

    if (fromStr !== toStr) {
      previous[key] = fromVal;
      updated[key] = toVal;
      diffs.push({
        field: key,
        from: fromVal,
        to: toVal,
      });
    }
  }

  return { previous, updated, diffs };
}

/**
 * Central logger for recording Operator/Admin actions across the backoffice.
 * Non-blocking, safe execution to prevent crashing core transactions.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const supabase = await createClient();

    // 1. Resolve Admin Session if not provided
    let adminId = params.adminId;
    let adminEmail = params.adminEmail;
    let adminRole = params.adminRole;

    if (!adminEmail || !adminId) {
      const session = await getAdminSession();
      if (session) {
        adminId = session.id;
        adminEmail = session.email;
        adminRole = session.is_superadmin ? "SuperAdmin" : session.admin_roles?.name || "Operator";
      } else {
        adminEmail = adminEmail || "system@newgamingstore.com";
        adminRole = adminRole || "System";
      }
    }

    // 2. Resolve Active Tenant ID if not provided
    let tenantId = params.tenantId;
    if (!tenantId) {
      tenantId = await getActiveAdminTenantId();
    }

    // 3. Extract Client IP and User Agent from request headers
    let ipAddress = "127.0.0.1";
    let userAgent = "Unknown";

    try {
      const headerList = await headers();
      ipAddress =
        headerList.get("x-forwarded-for")?.split(",")[0].trim() ||
        headerList.get("x-real-ip") ||
        "127.0.0.1";
      userAgent = headerList.get("user-agent") || "Unknown";
    } catch {
      // Ignored if headers() is called outside request lifecycle
    }

    // 4. Insert log entry into public.activity_logs
    const { error } = await supabase.from("activity_logs").insert([
      {
        tenant_id: tenantId || null,
        admin_id: adminId || null,
        admin_email: adminEmail,
        admin_role: adminRole,
        action: params.action,
        entity: params.entity,
        entity_id: params.entityId ? String(params.entityId) : null,
        description: params.description,
        payload: params.payload || {},
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    ]);

    if (error) {
      console.warn("[logActivity] Failed to insert activity log:", error.message);
    }
  } catch (err) {
    console.error("[logActivity Exception]", err);
  }
}
