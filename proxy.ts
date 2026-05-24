import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge-compatible JWT verification using crypto.subtle.
 * Cannot import lib/auth.ts here because @noble/hashes may not be available in Edge middleware.
 * This re-implements the minimal HMAC verification needed for middleware.
 */
async function verifyJWTInMiddleware(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      new TextEncoder().encode(data)
    );

    if (!valid) return null;

    const payload = JSON.parse(atob(data));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

function getCookie(request: NextRequest, name: string): string | undefined {
  const cookie = request.cookies.get(name);
  return cookie?.value;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    return NextResponse.next();
  }

  const token = getCookie(request, 'aquaflow_session');

  // Coach routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'coach');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const payload = await verifyJWTInMiddleware(token);
    if (!payload || payload.role !== 'coach') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'coach');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Athlete routes
  if (pathname.startsWith('/workout') || pathname.startsWith('/athlete') || pathname.startsWith('/profile') || pathname.startsWith('/archive')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'athlete');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const payload = await verifyJWTInMiddleware(token);
    if (!payload || payload.role !== 'athlete') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'athlete');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Catch-all: /athlete/* paths not matched by matcher above will fall through to API route guards
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
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
