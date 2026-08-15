/**
 * Client-Side Image Auto-Compression Utility
 * Compresses raw images (PNG, JPG, JPEG, GIF, WebP) into optimized WebP before sending to server/R2.
 * Uses high-quality canvas bicubic interpolation, preserves aspect ratio and alpha transparency.
 */

export interface CompressionPreset {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0.1 to 1.0
  mimeType: "image/webp" | "image/jpeg" | "image/png";
  preserveAlpha?: boolean;
}

export type CompressionPresetKey =
  | "icon"
  | "banner"
  | "slider"
  | "logo"
  | "qris"
  | "guide"
  | "avatar";

export const COMPRESSION_PRESETS: Record<CompressionPresetKey, CompressionPreset> = {
  // Preset 1: Icon Game, Produk, & Saluran Bayar (Square / Compact)
  icon: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.85,
    mimeType: "image/webp",
    preserveAlpha: true,
  },
  // Preset 2: Banner Hero, Background Popular, Footer, & OG Image
  banner: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.82,
    mimeType: "image/webp",
  },
  // Preset 3: Hero Slider Carousel Utama
  slider: {
    maxWidth: 1920,
    maxHeight: 800,
    quality: 0.82,
    mimeType: "image/webp",
  },
  // Preset 4: Logo Toko / Brand Header
  logo: {
    maxWidth: 600,
    maxHeight: 240,
    quality: 0.90,
    mimeType: "image/webp",
    preserveAlpha: true,
  },
  // Preset 5: Barcode QRIS (High precision crispness for camera scanning)
  qris: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.92,
    mimeType: "image/webp",
  },
  // Preset 6: Panduan Topup & Form Guide
  guide: {
    maxWidth: 1080,
    maxHeight: 1080,
    quality: 0.85,
    mimeType: "image/webp",
  },
  // Preset 7: Avatar Karakter CS WhatsApp
  avatar: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.88,
    mimeType: "image/webp",
    preserveAlpha: true,
  },
};

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  ratio: number; // e.g. 0.85 means 85% reduction
  formattedOriginal: string;
  formattedCompressed: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Compresses an image file on the client before upload.
 * Returns the optimized WebP File object along with compression stats.
 */
export async function compressImageClient(
  file: File,
  presetKey: CompressionPresetKey = "banner",
  customOptions?: Partial<CompressionPreset>
): Promise<CompressionResult> {
  // If not a standard image or running outside browser, return raw file
  if (typeof window === "undefined" || !file.type.startsWith("image/")) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      ratio: 0,
      formattedOriginal: formatFileSize(file.size),
      formattedCompressed: formatFileSize(file.size),
    };
  }

  // SVG or GIF animated files are kept original to preserve vector/frames
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      ratio: 0,
      formattedOriginal: formatFileSize(file.size),
      formattedCompressed: formatFileSize(file.size),
    };
  }

  const preset = {
    ...COMPRESSION_PRESETS[presetKey],
    ...customOptions,
  };

  return new Promise((resolve) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onerror = () => {
      // Fallback on error
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        ratio: 0,
        formattedOriginal: formatFileSize(originalSize),
        formattedCompressed: formatFileSize(originalSize),
      });
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        resolve({
          file,
          originalSize,
          compressedSize: originalSize,
          ratio: 0,
          formattedOriginal: formatFileSize(originalSize),
          formattedCompressed: formatFileSize(originalSize),
        });
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio downscaling
        if (width > preset.maxWidth || height > preset.maxHeight) {
          const widthRatio = preset.maxWidth / width;
          const heightRatio = preset.maxHeight / height;
          const bestRatio = Math.min(widthRatio, heightRatio);

          width = Math.round(width * bestRatio);
          height = Math.round(height * bestRatio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { alpha: preset.preserveAlpha ?? true });
        if (!ctx) {
          resolve({
            file,
            originalSize,
            compressedSize: originalSize,
            ratio: 0,
            formattedOriginal: formatFileSize(originalSize),
            formattedCompressed: formatFileSize(originalSize),
          });
          return;
        }

        // Enable high-quality smoothing for crisp output
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to WebP Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                originalSize,
                compressedSize: originalSize,
                ratio: 0,
                formattedOriginal: formatFileSize(originalSize),
                formattedCompressed: formatFileSize(originalSize),
              });
              return;
            }

            // Create new WebP File
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const compressedFile = new File([blob], newFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            const compressedSize = compressedFile.size;
            const ratio = originalSize > 0 ? (originalSize - compressedSize) / originalSize : 0;

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              ratio: Math.max(0, ratio),
              formattedOriginal: formatFileSize(originalSize),
              formattedCompressed: formatFileSize(compressedSize),
            });
          },
          preset.mimeType || "image/webp",
          preset.quality || 0.85
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
