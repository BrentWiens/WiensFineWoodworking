import { describe, expect, it } from 'vitest';
import { SignJWT } from 'jose';
import { isAllowedEmail, readSession, safeRedirectPath, signSession } from './session';

const SECRET = 'test-secret-that-is-at-least-32-characters-long';
const ME = 'owner@example.com';
const opts = { secret: SECRET, allowList: ME };

describe('isAllowedEmail', () => {
  it('matches case-insensitively against a comma or space separated list', () => {
    expect(isAllowedEmail('Owner@Example.com', 'owner@example.com')).toBe(true);
    expect(isAllowedEmail('b@x.com', 'a@x.com, b@x.com')).toBe(true);
    expect(isAllowedEmail('b@x.com', 'a@x.com b@x.com')).toBe(true);
  });

  it('allows nobody when the list is empty or missing', () => {
    expect(isAllowedEmail(ME, '')).toBe(false);
    expect(isAllowedEmail(ME, undefined)).toBe(false);
    expect(isAllowedEmail('', ' , ')).toBe(false);
    expect(isAllowedEmail(undefined, ME)).toBe(false);
  });

  it('does not match on substrings', () => {
    expect(isAllowedEmail('wner@example.com', ME)).toBe(false);
    expect(isAllowedEmail('owner@example.com.evil', ME)).toBe(false);
  });
});

describe('sessions', () => {
  it('round-trips the signed-in email', async () => {
    expect(await readSession(await signSession(ME, SECRET), opts)).toEqual({ email: ME });
  });

  it('stops accepting a session once the email leaves the allowlist', async () => {
    const token = await signSession(ME, SECRET);
    expect(await readSession(token, { secret: SECRET, allowList: 'someone-else@example.com' })).toBeNull();
  });

  it('rejects a token signed with another secret', async () => {
    const token = await signSession(ME, 'another-secret-that-is-also-32-characters!!');
    expect(await readSession(token, opts)).toBeNull();
  });

  it('rejects missing, garbage and expired tokens', async () => {
    expect(await readSession(undefined, opts)).toBeNull();
    expect(await readSession('not.a.jwt', opts)).toBeNull();

    const expired = await new SignJWT({ email: ME })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(ME)
      .setIssuer('wfinew.com')
      .setAudience('wfinew-business-tools')
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(new TextEncoder().encode(SECRET));
    expect(await readSession(expired, opts)).toBeNull();
  });

  it('treats a missing or short secret as signed out rather than crashing', async () => {
    const token = await signSession(ME, SECRET);
    expect(await readSession(token, { secret: 'short', allowList: ME })).toBeNull();
    await expect(signSession(ME, 'short')).rejects.toThrow(/SESSION_SECRET/);
  });
});

describe('safeRedirectPath', () => {
  it('keeps paths inside the private tools', () => {
    expect(safeRedirectPath('/tools/business')).toBe('/tools/business');
    expect(safeRedirectPath('/tools/business/mileage?year=2025')).toBe('/tools/business/mileage?year=2025');
  });

  it('falls back to the mileage log for anything else', () => {
    for (const next of [
      undefined, null, '', '/', '/tools', '/tools/business-evil', 'https://evil.com',
      '//evil.com', '/tools/business//evil.com', '/tools/business/\\evil',
    ]) {
      expect(safeRedirectPath(next)).toBe('/tools/business/mileage');
    }
  });
});
