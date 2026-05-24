import { NextResponse } from 'next/server';
export async function GET() {
  return new Response('My custom error', { status: 500 });
}
