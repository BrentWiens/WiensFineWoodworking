import { SignJWT, jwtVerify } from 'jose';

/**
 * Stateless session: a signed JWT in an httpOnly cookie, issued after Google
 * sign-in, carrying the signed-in email.
 *
 * Every check re-tests the email against ALLOWED_EMAILS, so removing an address
 * there locks that account out on the next request. To sign out every device at
 * once, change SESSION_SECRET and redeploy.
 *
 * Deliberately free of `server-only` and `next/headers` so proxy.ts, route handlers
 * and unit tests can all use it; the cookie plumbing for pages lives in ./dal.ts.
 */

export const SESSION_COOKIE = 'wfw_session';
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/** Everything behind sign-in lives under here — one prefix for proxy, robots and the service worker. */
export const PRIVATE_TOOLS_PREFIX = '/tools/business';

const ISSUER = 'wfinew.com';
const AUDIENCE = 'wfinew-business-tools';

export function secretKey(secret: string | undefined = process.env.SESSION_SECRET): Uint8Array {
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set to at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

/** Comma- or whitespace-separated list, compared case-insensitively. Empty list allows nobody. */
export function isAllowedEmail(email: unknown, allowList: string | undefined = process.env.ALLOWED_EMAILS): boolean {
  if (typeof email !== 'string' || !email) return false;
  const allowed = (allowList ?? '')
    .split(/[\s,]+/)
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export async function signSession(email: string, secret?: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase() })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(email.toLowerCase())
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey(secret));
}

/**
 * The signed-in email for a valid, unexpired session whose email is still allowed;
 * otherwise null. Never throws.
 */
export async function readSession(
  token: string | undefined,
  options: { secret?: string; allowList?: string } = {},
): Promise<{ email: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(options.secret), {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    const email = payload.email;
    if (typeof email !== 'string' || payload.sub !== email) return null;
    return isAllowedEmail(email, 'allowList' in options ? options.allowList : process.env.ALLOWED_EMAILS)
      ? { email }
      : null;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('SESSION_SECRET')) {
      console.error(error.message);
    }
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Lax, not Strict: the browser arrives back from Google on a cross-site redirect
    // chain, and a Strict cookie set at the end of that chain isn't sent on the very
    // next page load — which would bounce straight back to sign-in. Server Actions
    // still check the Origin header, so Lax doesn't open up CSRF.
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Where to send the user after sign-in. Only paths under the private tools prefix
 * are allowed, so `next` can't become an open redirect (`//evil.com`, `/\evil.com`).
 */
export function safeRedirectPath(next: unknown): string {
  const fallback = `${PRIVATE_TOOLS_PREFIX}/mileage`;
  if (typeof next !== 'string') return fallback;
  if (!next.startsWith(PRIVATE_TOOLS_PREFIX)) return fallback;
  const rest = next.slice(PRIVATE_TOOLS_PREFIX.length);
  if (rest !== '' && !/^[/?#]/.test(rest)) return fallback;
  if (next.includes('\\') || next.includes('//')) return fallback;
  return next;
}
