import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, readSession } from '@/lib/auth/session';

/**
 * Sends signed-out visitors of the private business tools to the sign-in page.
 *
 * This is the optimistic first check only — lib/auth/dal.ts verifies the session
 * again beside every database call. The matcher keeps the proxy off every other
 * route, so the public pages stay statically generated.
 */
export async function proxy(request: NextRequest) {
  if (await readSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const login = new URL('/login', request.url);
  login.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  // Must match PRIVATE_TOOLS_PREFIX in lib/auth/session.ts (matchers have to be literals).
  matcher: ['/tools/business/:path*'],
};
