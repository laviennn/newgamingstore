/**
 * Utility functions for Multi-Tenant Object Storage & Cloudflare R2 Asset Domains.
 * Supports zero-migration white-label asset domain resolution.
 */

/**
 * Resolves the public asset domain URL for a specific tenant.
 * 
 * Hierarchy:
 * 1. Explicit Custom Asset Domain (from tenant configuration if set, e.g. "https://cdn.tenant.com")
 * 2. Automatic Tenant Subdomain: "https://assets.<tenant_domain>" (e.g. "https://assets.topupdisiniyuk.com")
 * 3. Fallback: process.env.R2_PUBLIC_URL or "https://assets.newgamingstore.com" (used for localhost/dev)
 * 
 * @param domain - Storefront domain of the tenant (e.g. "topupdisiniyuk.com" or "localhost:3000")
 * @param customPublicUrl - Optional explicit override from tenant settings
 * @returns Public base URL without trailing slash (e.g. "https://assets.topupdisiniyuk.com")
 */
export function resolveTenantAssetDomain(domain?: string | null, customPublicUrl?: string | null): string {
  // 1. Explicit custom URL override
  if (customPublicUrl && customPublicUrl.trim().length > 0) {
    let clean = customPublicUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean.endsWith('/') ? clean.slice(0, -1) : clean;
  }

  // Fallback default from ENV
  const defaultEnvUrl = process.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_DOMAIN || 'https://assets.newgamingstore.com';
  const cleanDefault = defaultEnvUrl.endsWith('/') ? defaultEnvUrl.slice(0, -1) : defaultEnvUrl;

  if (!domain || domain.trim().length === 0) {
    return cleanDefault;
  }

  // 2. Clean domain (strip protocol, port, path)
  let cleanDomain = domain.toLowerCase().trim();
  cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
  cleanDomain = cleanDomain.split('/')[0];
  cleanDomain = cleanDomain.split(':')[0]; // Remove port :3000

  // If local development environment or IP address, fallback to default R2 URL
  const isLocalOrDev = 
    cleanDomain.includes('localhost') || 
    cleanDomain.includes('127.0.0.1') || 
    cleanDomain.includes('0.0.0.0') ||
    cleanDomain.endsWith('.local') ||
    cleanDomain === 'test';

  if (isLocalOrDev) {
    return cleanDefault;
  }

  // Remove leading "admin." if present so assets domain is "assets.<mainDomain>"
  if (cleanDomain.startsWith('admin.')) {
    cleanDomain = cleanDomain.replace(/^admin\./, '');
  }

  // Remove leading "www." if present
  if (cleanDomain.startsWith('www.')) {
    cleanDomain = cleanDomain.replace(/^www\./, '');
  }

  // 3. Return tenant-branded asset domain
  return `https://assets.${cleanDomain}`;
}

/**
 * Normalizes legacy or raw R2 developer URLs (pub-*.r2.dev) to the tenant's public asset domain.
 * 
 * @param url - Raw image URL
 * @param tenantDomain - Optional tenant domain for custom domain replacement
 * @returns Cleaned public URL
 */
export function normalizeAssetUrl(url: string | null | undefined, tenantDomain?: string | null): string {
  if (!url) return '';
  
  const baseAssetUrl = resolveTenantAssetDomain(tenantDomain);
  const host = baseAssetUrl.replace(/^https?:\/\//, '');

  // Replace legacy pub-*.r2.dev URLs
  return url.replace(/https?:\/\/[a-zA-Z0-9-]+\.r2\.dev/, baseAssetUrl)
            .replace(/pub-[a-zA-Z0-9]+\.r2\.dev/, host);
}
