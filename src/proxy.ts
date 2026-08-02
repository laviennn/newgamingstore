import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  let hostname = req.headers.get('host') || 'localhost:3000';

  // Allow for local development
  hostname = hostname.replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost'}`);

  // Special case for local testing
  if (hostname === 'localhost:3000' || hostname === '127.0.0.1:3000') {
    hostname = 'demo.localhost'; // Default to a demo tenant for local dev
  }
  
  // Extract the tenant domain (removing port if present)
  const currentHost = hostname.split(':')[0];

  // Map admin domain
  if (currentHost.startsWith('admin.') || currentHost === process.env.NEXT_PUBLIC_ADMIN_DOMAIN) {
    return NextResponse.rewrite(new URL(`/admin${url.pathname}${url.search}`, req.url));
  }

  // Rewrite to the tenant-specific storefront
  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}${url.search}`, req.url));
}
