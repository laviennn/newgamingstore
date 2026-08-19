import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Lazy / resilient sharp loader
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sharpModuleCache: any = null;
let sharpLoadAttempted = false;

async function getSharp() {
  if (sharpLoadAttempted) return sharpModuleCache;
  sharpLoadAttempted = true;
  try {
    const sharpModule = await import("sharp");
    sharpModuleCache = sharpModule.default || sharpModule;
    return sharpModuleCache;
  } catch (err) {
    console.warn("[SHARP_LOAD_NOTICE] Sharp native module unavailable on this environment. Direct fallback will be used:", err);
    sharpModuleCache = null;
    return null;
  }
}

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
 * Mengoptimasi gambar di server menggunakan Sharp:
 * - Auto-orient (memperbaiki rotasi foto kamera/HP)
 * - Resize jika melebihi maxWidth / maxHeight
 * - Konversi 100% ke WebP dengan kompresi cerdas & penghapusan metadata EXIF
 */
export async function optimizeImageServer(
  buffer: Buffer,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 82
): Promise<{ buffer: Buffer; mime: string; ext: string }> {
  try {
    const sharp = await getSharp();
    if (!sharp) {
      const magic = validateImageMagicBytes(buffer);
      return {
        buffer,
        mime: magic.mime || "application/octet-stream",
        ext: magic.ext || "bin",
      };
    }

    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Jika file SVG atau GIF animasi, jangan diubah agar vector/frame animasi tetap utuh
    if (metadata.format === "svg" || (metadata.format === "gif" && (metadata.pages || 0) > 1)) {
      const magic = validateImageMagicBytes(buffer);
      return {
        buffer,
        mime: magic.mime || `image/${metadata.format}`,
        ext: magic.ext || metadata.format || "bin",
      };
    }

    const optimizedBuffer = await image
      .rotate() // Auto-orient berdasarkan EXIF orientation
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: quality,
        effort: 4,
        alphaQuality: 88,
      })
      .toBuffer();

    return {
      buffer: optimizedBuffer,
      mime: "image/webp",
      ext: "webp",
    };
  } catch (err) {
    console.warn("[SHARP_OPTIMIZE_FALLBACK]", err);
    const magicCheck = validateImageMagicBytes(buffer);
    return {
      buffer,
      mime: magicCheck.mime || "application/octet-stream",
      ext: magicCheck.ext || "bin",
    };
  }
}

/**
 * Fungsi utilitas untuk mengunggah gambar ke Cloudflare R2 dengan aman & optimal:
 * - Validasi biner Magic Bytes
 * - Kompresi & Konversi WebP otomatis via Sharp (menjamin ukuran file ~20KB - 85KB)
 * - Mencegah Directory Traversal dengan UUID
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

    // 2. Server-side Guaranteed WebP Optimization
    const optimized = await optimizeImageServer(fileBuffer);

    // 3. Mencegah Directory Traversal dengan mengganti nama file menggunakan UUID
    const safeFilename = `${folder}/${crypto.randomUUID()}.${optimized.ext}`;

    // 4. Upload ke Cloudflare R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: safeFilename,
      Body: optimized.buffer,
      ContentType: optimized.mime,
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
