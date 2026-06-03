import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

function getCookie(request: NextRequest, name: string): string | undefined {
  const cookie = request.cookies.get(name);
  return cookie?.value;
}

/**
 * Validate redirect URL to prevent open redirect attacks.
 * Only allows relative paths starting with /.
 */
function safeRedirectUrl(pathname: string): string {
  // Only allow paths starting with / that don't start with //
  if (!pathname.startsWith('/') || pathname.startsWith('//')) {
    return '/';
  }
  // Strip fragment and query for safety, only allow the path
  return pathname.split('?')[0].split('#')[0] || '/';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  // Security headers on every page response
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Public routes — no auth required
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/poolside') ||
    pathname.startsWith('/setup') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/_next') ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|json|webmanifest)$/)
  ) {
    return response;
  }

  const token = getCookie(request, 'aquaflow_session');

  // Coach routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'coach');
      loginUrl.searchParams.set('redirect', safeRedirectUrl(pathname));
      return NextResponse.redirect(loginUrl);
    }
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'coach') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'coach');
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // Athlete routes
  if (pathname.startsWith('/workout') || pathname.startsWith('/athlete') || pathname.startsWith('/profile') || pathname.startsWith('/archive')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'athlete');
      loginUrl.searchParams.set('redirect', safeRedirectUrl(pathname));
      return NextResponse.redirect(loginUrl);
    }
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'athlete') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'athlete');
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings',
    '/settings/:path*',
    '/workout',
    '/workout/:path*',
    '/profile',
    '/profile/:path*',
    '/archive',
    '/archive/:path*',
    '/poolside/:path*',
    '/login',
    '/setup',
    '/api/:path*',
  ],
};
