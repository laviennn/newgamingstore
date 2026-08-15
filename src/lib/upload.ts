import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const endpoint =
  process.env.R2_ENDPOINT ||
  (process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : "");

// Inisialisasi S3 Client untuk Cloudflare R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const PUBLIC_DOMAIN =
  process.env.R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_URL || "";

/**
 * Memeriksa header Magic Bytes file untuk memastikan tipe file sebenarnya adalah gambar.
 * Mencegah pengunggahan file berbahaya (.php, .exe, .sh) yang menyamar sebagai file gambar.
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; ext?: string; mime?: string } {
  if (!buffer || buffer.length < 4) return { valid: false };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: "jpg", mime: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { valid: true, ext: "png", mime: "image/png" };
  }

  // GIF: 47 49 46 38
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { valid: true, ext: "gif", mime: "image/gif" };
  }

  // WEBP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length >= 12 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, ext: "webp", mime: "image/webp" };
  }

  return { valid: false };
}

/**
 * Fungsi utilitas untuk mengunggah gambar ke Cloudflare R2 dengan aman:
 * - Menelaah Magic Bytes untuk memastikan sanitasi tipe gambar
 * - Mengganti nama file acak menggunakan crypto.randomUUID() untuk menghindari serangan Directory Traversal
 */
export async function uploadImageToR2(
  fileBuffer: Buffer,
  folder: string = "uploads",
  publicBaseUrl?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 1. Validation biner Magic Bytes
    const magicCheck = validateImageMagicBytes(fileBuffer);
    if (!magicCheck.valid) {
      return {
        success: false,
        error: "Security Violation: File yang diunggah gagal divalidasi (Magic bytes bukan format gambar valid JPEG/PNG/GIF/WebP).",
      };
    }

    // 2. Mencegah Directory Traversal dengan mengganti nama file menggunakan UUID
    const safeFilename = `${folder}/${crypto.randomUUID()}.${magicCheck.ext}`;

    // 3. Upload ke Cloudflare R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: safeFilename,
      Body: fileBuffer,
      ContentType: magicCheck.mime,
    });

    await r2Client.send(command);

    const activeDomain = publicBaseUrl || PUBLIC_DOMAIN;
    const baseUrl = activeDomain.endsWith('/') ? activeDomain.slice(0, -1) : activeDomain;
    const publicUrl = `${baseUrl}/${safeFilename}`;
    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("[R2_UPLOAD_ERROR]", err);
    return { success: false, error: err.message || "Gagal mengunggah gambar ke Cloudflare R2 Storage." };
  }
}
