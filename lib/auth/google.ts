import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';
import { secretKey } from './session';

/**
 * "Sign in with Google" as a plain OpenID Connect authorization-code flow with PKCE.
 * jose (already used for sessions) covers the token checks, so there is no auth
 * library to keep compatible with each Next major.
 *
 * Flow: /api/auth/google → Google → /api/auth/google/callback → session cookie.
 */

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

/** Short-lived cookie holding the PKCE verifier, state and nonce between the two hops. */
export const OAUTH_COOKIE = 'wfw_oauth';
export const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;
const OAUTH_AUDIENCE = 'wfinew-oauth';

export function googleConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function callbackUrl(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

function randomToken(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
}

async function sha256Base64Url(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Buffer.from(digest).toString('base64url');
}

export interface OAuthState {
  state: string;
  verifier: string;
  nonce: string;
  next: string;
}

/** Builds Google's authorization URL plus the signed cookie value that must accompany it. */
export async function startGoogleSignIn(
  clientId: string,
  origin: string,
  next: string,
): Promise<{ url: string; cookie: string }> {
  const oauth: OAuthState = { state: randomToken(), verifier: randomToken(), nonce: randomToken(), next };

  const url = new URL(AUTHORIZE_URL);
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl(origin),
    response_type: 'code',
    scope: 'openid email',
    state: oauth.state,
    nonce: oauth.nonce,
    code_challenge: await sha256Base64Url(oauth.verifier),
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();

  const cookie = await new SignJWT({ ...oauth })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience(OAUTH_AUDIENCE)
    .setExpirationTime(`${OAUTH_COOKIE_MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  return { url: url.toString(), cookie };
}

export async function readOAuthCookie(value: string | undefined): Promise<OAuthState | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtVerify(value, secretKey(), { algorithms: ['HS256'], audience: OAUTH_AUDIENCE });
    const { state, verifier, nonce, next } = payload;
    if ([state, verifier, nonce, next].every(v => typeof v === 'string')) {
      return { state, verifier, nonce, next } as OAuthState;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Swaps the authorization code for an ID token and verifies it: Google's signature,
 * issuer, audience, expiry, our nonce, and a verified email address.
 */
export async function finishGoogleSignIn(params: {
  code: string;
  oauth: OAuthState;
  origin: string;
  clientId: string;
  clientSecret: string;
}): Promise<{ email: string } | null> {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: params.code,
      client_id: params.clientId,
      client_secret: params.clientSecret,
      redirect_uri: callbackUrl(params.origin),
      grant_type: 'authorization_code',
      code_verifier: params.oauth.verifier,
    }),
  });
  if (!response.ok) {
    console.error('Google token exchange failed:', response.status, await response.text());
    return null;
  }

  const { id_token: idToken } = (await response.json()) as { id_token?: string };
  if (!idToken) return null;

  const { payload } = await jwtVerify(idToken, googleKeys, {
    issuer: GOOGLE_ISSUERS,
    audience: params.clientId,
  });
  if (payload.nonce !== params.oauth.nonce) return null;
  if (payload.email_verified !== true || typeof payload.email !== 'string') return null;

  return { email: payload.email.toLowerCase() };
}
