'use client';

export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Jika gambar adalah path lokal (dimulai dengan /), langsung kembalikan src-nya.
  // Karena wsrv.nl tidak bisa mengakses localhost dan static assets biasanya sudah ringan.
  if (src.startsWith('/')) {
    return src;
  }

  // Gunakan wsrv.nl untuk mengoptimasi gambar eksternal (misalnya dari R2 Storage).
  // Layanan ini gratis dan akan mengonversi gambar ke WebP serta melakukan resize
  // di Edge CDN, sehingga Vercel Image Optimization quota tidak akan terpakai.
  return `https://wsrv.nl/?url=${encodeURIComponent(
    src
  )}&w=${width}&q=${quality || 75}&output=webp`;
}
