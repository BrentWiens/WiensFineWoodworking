import { NextResponse, type NextRequest } from 'next/server';
import { OAUTH_COOKIE, OAUTH_COOKIE_MAX_AGE_SECONDS, googleConfig, startGoogleSignIn } from '@/lib/auth/google';
import { safeRedirectPath } from '@/lib/auth/session';

/** Step 1 of Google sign-in: remember state + PKCE verifier, then send the browser to Google. */
export async function GET(request: NextRequest) {
  const config = googleConfig();
  if (!config || !process.env.SESSION_SECRET) {
    console.error('Google sign-in needs GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and SESSION_SECRET.');
    return NextResponse.redirect(new URL('/login?error=config', request.url));
  }

  const next = safeRedirectPath(request.nextUrl.searchParams.get('next'));
  const { url, cookie } = await startGoogleSignIn(config.clientId, request.nextUrl.origin, next);

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Lax so it comes back on Google's top-level redirect to the callback.
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
