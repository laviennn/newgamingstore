import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

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

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname.toLowerCase();

  // Explicit fast-path bypass for Next.js internals, static chunks, and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/_next' ||
    pathname.startsWith('/api/') ||
    pathname === '/api' ||
    pathname.startsWith('/_static/') ||
    pathname === '/_static' ||
    pathname.startsWith('/_vercel/') ||
    pathname === '/_vercel' ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot|mp4|webm|pdf|json|txt|map)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  let hostname = req.headers.get('host') || 'localhost:3000';


  // Allow for local development
  hostname = hostname.replace(
    '.localhost:3000',
    `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost'}`,
  );

  // Special case for local testing
  if (hostname === 'localhost:3000' || hostname === '127.0.0.1:3000') {
    hostname = 'localhost'; // Map directly to 'localhost' tenant configured in DB
  }

  // Extract the tenant domain (removing port if present)
  const currentHost = hostname.split(':')[0];
  const isAdminDomain =
    currentHost.startsWith('admin.') ||
    currentHost === process.env.NEXT_PUBLIC_ADMIN_DOMAIN;
  const isLoginPath = pathname === '/login' || pathname === '/admin/login';
  const isServerAction = req.headers.has('next-action');

  // Check rate limit on direct POST requests to Admin Login (non-Server Action)
  if (isAdminDomain && isLoginPath && req.method === 'POST' && !isServerAction) {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const rateLimit = await checkRateLimit('admin-login', clientIp);

    if (!rateLimit.success) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: `Terlalu banyak percobaan login (Too Many Requests). Silakan coba lagi dalam ${rateLimit.reset} detik.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.reset),
          },
        }
      );
    }
  }

  let response: NextResponse;

  // Map admin domain
  if (
    currentHost.startsWith('admin.') ||
    currentHost === process.env.NEXT_PUBLIC_ADMIN_DOMAIN
  ) {
    // If the path already starts with /admin, don't prepend it again
    const path = url.pathname.startsWith('/admin')
      ? url.pathname
      : `/admin${url.pathname}`;
    response = NextResponse.rewrite(new URL(`${path}${url.search}`, req.url));
  } else {
    // Rewrite to the tenant-specific storefront
    response = NextResponse.rewrite(
      new URL(`/${currentHost}${url.pathname}${url.search}`, req.url),
    );
  }

  // 2. Handle Maintenance Bypass Query Parameter (e.g. /?bypass_maintenance=true)
  const bypassParam =
    url.searchParams.get('bypass_maintenance') ||
    url.searchParams.get('preview');
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
