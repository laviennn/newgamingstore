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

  // 1. Handle Path-Based Bypass (e.g. /bypass_maintenance=true or /bypass or /preview)
  const pathname = url.pathname.toLowerCase();
  if (pathname.includes('bypass') || pathname.includes('preview')) {
    const isDisable = pathname.includes('false') || pathname.includes('off') || pathname.includes('disable');
    const redirectRes = NextResponse.redirect(new URL('/', req.url));
    if (isDisable) {
      redirectRes.cookies.delete('bypass_maintenance');
    } else {
      redirectRes.cookies.set('bypass_maintenance', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });
    }
    return redirectRes;
  }

  let response: NextResponse;

  // Map admin domain
  if (currentHost.startsWith('admin.') || currentHost === process.env.NEXT_PUBLIC_ADMIN_DOMAIN) {
    // If the path already starts with /admin, don't prepend it again
    const path = url.pathname.startsWith('/admin') ? url.pathname : `/admin${url.pathname}`;
    response = NextResponse.rewrite(new URL(`${path}${url.search}`, req.url));
  } else {
    // Rewrite to the tenant-specific storefront
    response = NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}${url.search}`, req.url));
  }

  // 2. Handle Maintenance Bypass Query Parameter (e.g. /?bypass_maintenance=true)
  const bypassParam = url.searchParams.get('bypass_maintenance') || url.searchParams.get('preview');
  if (bypassParam === 'true') {
    response.cookies.set('bypass_maintenance', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });
  } else if (bypassParam === 'false') {
    response.cookies.delete('bypass_maintenance');
  }

  return response;
}
