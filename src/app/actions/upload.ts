"use server";

import { uploadImageToR2 } from "@/lib/upload";
import { resolveTenantAssetDomain } from "@/lib/storageUtils";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided." };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { error: "Ukuran file terlalu besar. Maksimal 10MB." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Resolve Tenant Context for Dynamic Branded Asset Domain
    let tenantDomain: string | null = null;
    let customAssetDomain: string | null = null;

    try {
      const supabase = await createClient();
      const adminTenantId = await getActiveAdminTenantId();

      if (adminTenantId) {
        const { data: tenantData } = await supabase
          .from("tenants")
          .select("domain, theme_config")
          .eq("id", adminTenantId)
          .maybeSingle();

        if (tenantData) {
          tenantDomain = tenantData.domain;
          customAssetDomain = tenantData.theme_config?.storage_public_url || tenantData.theme_config?.custom_asset_domain || null;
        }
      } else {
        // Fallback to Hostname detection (for storefront customer payment proof uploads)
        const headerList = await headers();
        const rawHost = headerList.get("host") || headerList.get("x-forwarded-host") || "";
        const domainWithoutPort = rawHost.split(":")[0];

        if (domainWithoutPort) {
          const { data: matchedTenant } = await supabase
            .from("tenants")
            .select("domain, theme_config")
            .or(`admin_domain.eq.${domainWithoutPort},domain.eq.${domainWithoutPort}`)
            .maybeSingle();

          if (matchedTenant) {
            tenantDomain = matchedTenant.domain;
            customAssetDomain = matchedTenant.theme_config?.storage_public_url || matchedTenant.theme_config?.custom_asset_domain || null;
          }
        }
      }
    } catch (tenantErr) {
      console.warn("[UPLOAD_TENANT_DETECTION_WARNING]", tenantErr);
    }

    // Resolve tenant-specific public asset domain (e.g. https://assets.topupdisiniyuk.com)
    const publicBaseUrl = resolveTenantAssetDomain(tenantDomain, customAssetDomain);

    // Gunakan utilitas terpusat uploadImageToR2 (Magic Bytes Check + UUID sanitization + Dynamic Tenant Domain)
    const result = await uploadImageToR2(buffer, "uploads", publicBaseUrl);

    if (!result.success || !result.url) {
      return { error: result.error || "Gagal mengunggah file gambar." };
    }

    return { url: result.url };
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return { error: (error as Error).message || "Failed to upload file." };
  }
}

export interface UploadErrorLogParams {
  context: string;
  invoiceId?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  errorMessage: string;
  errorStack?: string;
  userAgent?: string;
  url?: string;
}

export async function logUploadError(params: UploadErrorLogParams) {
  try {
    const timestamp = new Date().toISOString();
    console.error(
      `[PAYMENT_UPLOAD_ERROR] [${timestamp}] Context: "${params.context}" | Invoice: "${params.invoiceId || 'N/A'}" | File: "${params.fileName || 'N/A'}" (${params.fileSize || 0} bytes, ${params.fileType || 'N/A'}) | UserAgent: "${params.userAgent || 'N/A'}" | Error: ${params.errorMessage}`,
      {
        ...params,
        timestamp,
      }
    );
    return { success: true };
  } catch (err) {
    console.error("Failed to execute logUploadError:", err);
    return { error: "Failed to log upload error" };
  }
}
