import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

function getCookie(request: NextRequest, name: string): string | undefined {
  const cookie = request.cookies.get(name);
  return cookie?.value;
}

export async function middleware(request: NextRequest) {
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
    const payload = await verifyJWT(token);
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
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'athlete') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'athlete');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

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
