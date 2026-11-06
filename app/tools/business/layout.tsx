import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components';
import { verifySession } from '@/lib/auth/dal';
import { signOut } from './actions';

export const metadata: Metadata = {
  title: 'Business Tools | Wiens Fine Woodworking',
  robots: { index: false, follow: false },
};

/**
 * Shell for the private business tools (mileage now; expenses, quotes and invoices
 * later). Everything under /tools/business requires Google sign-in — see proxy.ts
 * and lib/auth/dal.ts.
 */
export default async function BusinessToolsLayout({ children }: { children: React.ReactNode }) {
  const { email } = await verifySession();

  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen bg-stone-50 pt-28 sm:pt-36 lg:pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between gap-3 text-sm text-stone-600 py-3">
            <Link href="/tools" className="hover:text-stone-900">
              ← All tools
            </Link>
            <form action={signOut} className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:inline truncate" title={email}>
                {email}
              </span>
              <button type="submit" className="underline underline-offset-2 hover:text-stone-900 shrink-0">
                Sign out
              </button>
            </form>
          </div>
          {children}
        </div>
      </main>
    </>
  );
}
