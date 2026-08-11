import { z } from "zod";
import { getAdminSession, getActiveAdminTenantId } from "@/app/admin/actions";
import { createClient } from "@/utils/supabase/server";

export interface ActionContext {
  userId?: string;
  tenantId: string;
  isSuperAdmin?: boolean;
  permissions?: string[];
  supabase: Awaited<ReturnType<typeof createClient>>;
}

export type SafeActionHandler<TSchema extends z.ZodTypeAny, TResult> = (
  data: z.infer<TSchema>,
  ctx: ActionContext
) => Promise<TResult>;

/**
 * Higher-Order Function (Wrapper) untuk mengamankan Next.js Server Actions.
 * - Mengautentikasi sesi pengguna / admin
 * - Mengunci tenant_id untuk mencegah serangan BOLA / IDOR lintas tenant
 * - Memvalidasi skema data masuk menggunakan Zod
 */
export function createSafeAction<TSchema extends z.ZodTypeAny, TResult>(
  schema: TSchema,
  handler: SafeActionHandler<TSchema, TResult>,
  options?: { requireAuth?: boolean; requiredPermission?: string }
) {
  return async (input: unknown): Promise<{ success: boolean; data?: TResult; error?: string }> => {
    try {
      const supabase = await createClient();
      const requireAuth = options?.requireAuth ?? true;

      let userId: string | undefined;
      let isSuperAdmin = false;
      let permissions: string[] = [];

      if (requireAuth) {
        const adminSession = await getAdminSession();
        if (!adminSession) {
          return {
            success: false,
            error: "Unauthorized: Akses ditolak. Silakan login terlebih dahulu.",
          };
        }

        userId = adminSession.id;
        isSuperAdmin = Boolean(adminSession.is_superadmin);
        permissions = adminSession.admin_roles?.permissions || [];

        if (
          options?.requiredPermission &&
          !isSuperAdmin &&
          !permissions.includes(options.requiredPermission)
        ) {
          return {
            success: false,
            error: `Forbidden: Anda tidak memiliki izin '${options.requiredPermission}'.`,
          };
        }
      }

      const tenantId = await getActiveAdminTenantId();
      if (!tenantId) {
        return { success: false, error: "Bad Request: Tenant ID tidak aktif." };
      }

      // Validasi input dengan Zod Schema
      const parseResult = schema.safeParse(input);
      if (!parseResult.success) {
        const errorMessage = parseResult.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        return { success: false, error: `Validation Error: ${errorMessage}` };
      }

      // Eksekusi logic handler utama dengan konteks yang aman
      const data = await handler(parseResult.data, {
        userId,
        tenantId,
        isSuperAdmin,
        permissions,
        supabase,
      });

      return { success: true, data };
    } catch (err: any) {
      console.error("[SAFE_ACTION_ERROR]", err);
      return {
        success: false,
        error: err.message || "Terjadi kesalahan internal pada Server Action.",
      };
    }
  };
}
