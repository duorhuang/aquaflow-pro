/**
 * API route auth helpers.
 * Extract and verify JWT from request cookies, enforce role-based access.
 */

import { NextResponse } from 'next/server';
import { verifyJWT, getCookieFromRequest, JWTPayload, hashPassword } from './auth';

// Re-export hashPassword for use in API routes
export { hashPassword };

async function getAuth(request: Request): Promise<JWTPayload | null> {
  const token = getCookieFromRequest(request, 'aquaflow_session');
  if (!token) return null;
  return verifyJWT(token);
}

function unauthorized(msg = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: msg }, { status: 401 });
}

function forbidden(msg = 'Forbidden'): NextResponse {
  return NextResponse.json({ error: msg }, { status: 403 });
}

/**
 * Require coach role. Returns the payload or a NextResponse that should be returned early.
 * Usage: const auth = await requireCoach(request); if (auth instanceof NextResponse) return auth;
 */
export async function requireCoach(request: Request): Promise<JWTPayload | NextResponse> {
  const auth = await getAuth(request);
  if (!auth) return unauthorized();
  if (auth.role !== 'coach') return forbidden('Coach access required');
  return auth;
}

/**
 * Require athlete role. Returns the payload or a NextResponse.
 */
export async function requireAthlete(request: Request): Promise<JWTPayload | NextResponse> {
  const auth = await getAuth(request);
  if (!auth) return unauthorized();
  if (auth.role !== 'athlete') return forbidden('Athlete access required');
  return auth;
}

/**
 * Require any authenticated user. Returns the payload or a NextResponse.
 */
export async function requireAnyAuth(request: Request): Promise<JWTPayload | NextResponse> {
  const auth = await getAuth(request);
  if (!auth) return unauthorized();
  return auth;
}

/**
 * Get the current user from the request, or null if unauthenticated.
 * Does NOT return a response — just returns the payload or null.
 */
export async function getOptionalAuth(request: Request): Promise<JWTPayload | null> {
  return getAuth(request);
}
