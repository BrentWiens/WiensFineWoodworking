import { NextResponse, type NextRequest } from 'next/server';
import { OAUTH_COOKIE, finishGoogleSignIn, googleConfig, readOAuthCookie } from '@/lib/auth/google';
import { SESSION_COOKIE, isAllowedEmail, sessionCookieOptions, signSession } from '@/lib/auth/session';

/** Step 2 of Google sign-in: verify Google's answer, check the allowlist, issue the session. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const oauth = await readOAuthCookie(request.cookies.get(OAUTH_COOKIE)?.value);

  const fail = (error: string) => {
    const response = NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
    response.cookies.delete({ name: OAUTH_COOKIE, path: '/api/auth' });
    return response;
  };

  // The user backed out on Google's screen.
  if (params.get('error')) return fail('cancelled');

  const config = googleConfig();
  if (!config) return fail('config');

  // A missing or mismatched state means this callback didn't come from a sign-in we started.
  const code = params.get('code');
  if (!oauth || !code || params.get('state') !== oauth.state) return fail('expired');

  let email: string;
  try {
    const result = await finishGoogleSignIn({ code, oauth, origin: request.nextUrl.origin, ...config });
    if (!result) return fail('failed');
    email = result.email;
  } catch (error) {
    console.error('Google sign-in failed:', error);
    return fail('failed');
  }

  if (!isAllowedEmail(email)) {
    console.warn(`Sign-in refused for ${email}: not in ALLOWED_EMAILS.`);
    return fail('denied');
  }

  const response = NextResponse.redirect(new URL(oauth.next, request.url));
  response.cookies.set(SESSION_COOKIE, await signSession(email), sessionCookieOptions());
  response.cookies.delete({ name: OAUTH_COOKIE, path: '/api/auth' });
  return response;
}
