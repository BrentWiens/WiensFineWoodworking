import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, readSession } from './session';

/**
 * The real authorization check. proxy.ts only redirects early as a convenience —
 * every data-access function calls this before touching the database, so a missed
 * proxy matcher or a direct Server Action POST still can't read or write anything.
 */
export const verifySession = cache(async (): Promise<{ email: string }> => {
  const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) redirect('/login');
  return session;
});

/** Non-redirecting check, for the login page to skip itself when already signed in. */
export async function currentSession(): Promise<{ email: string } | null> {
  return readSession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
