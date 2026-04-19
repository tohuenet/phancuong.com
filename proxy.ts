import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

// Rate limiting map: Map<IP, { count: number, resetTime: number }>
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

/**
 * Next.js 16 Proxy Function
 * Replaces the deprecated middleware.ts
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Block unwanted metrics polling to save resources
  if (pathname === '/api/metrics/prometheus') {
    return new NextResponse(null, { status: 404 });
  }

  // 2. Rate Limiting for API routes
  if (pathname.startsWith('/api')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
    const now = Date.now();
    const rateLimit = rateLimitMap.get(ip);

    if (rateLimit && now < rateLimit.resetTime) {
      if (rateLimit.count >= MAX_REQUESTS) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
      rateLimit.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }
  }

  // 2. Admin Route Protection
  if (pathname.startsWith('/admin')) {
    const session = await auth();
    const allowedEmail = process.env.ALLOWED_EMAIL;

    // Strict check: Must be logged in AND must match the allowed email
    if (!session || (allowedEmail && session.user?.email !== allowedEmail)) {
      const url = request.nextUrl.clone();
      
      // If not logged in, redirect to signin
      if (!session) {
        url.pathname = '/api/auth/signin';
      } else {
        // If logged in but not authorized, redirect to unauthorized page
        url.pathname = '/unauthorized';
      }
      
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
