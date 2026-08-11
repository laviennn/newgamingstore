"use server";

import { uploadImageToR2 } from "@/lib/upload";

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided." };
    }

    if (file.size > 2.5 * 1024 * 1024) {
      return { error: "Ukuran file terlalu besar. Maksimal 2MB." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Gunakan utilitas terpusat uploadImageToR2 (Magic Bytes Check + UUID sanitization)
    const result = await uploadImageToR2(buffer, "uploads");

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
