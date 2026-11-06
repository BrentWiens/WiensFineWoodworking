import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components';
import { currentSession } from '@/lib/auth/dal';
import { safeRedirectPath } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Sign in | Wiens Fine Woodworking',
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  denied: "That Google account doesn't have access to these tools.",
  cancelled: 'Sign-in was cancelled.',
  expired: 'The sign-in took too long or was started in another tab. Please try again.',
  failed: "Google sign-in didn't complete. Please try again.",
  config: 'Sign-in is not configured on this server yet.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeRedirectPath(rawNext);

  if (await currentSession()) redirect(next);

  const message = error ? (ERRORS[error] ?? ERRORS.failed) : null;

  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen bg-stone-50 pt-28 sm:pt-36 lg:pt-28 px-4">
        <div className="max-w-md mx-auto mt-8 bg-white border border-stone-200 rounded-lg shadow-sm p-6 sm:p-8 text-center">
          <LockIcon />
          <h1 className="text-2xl font-bold text-stone-800 mt-3 mb-2">Private business tool</h1>
          <p className="text-stone-600 mb-6">
            I&apos;m testing this business tool, so it&apos;s private for now. If you&apos;d like access,{' '}
            <Link href="/#contact" className="underline underline-offset-2 hover:text-stone-900">
              get in touch
            </Link>
            . The{' '}
            <Link href="/tools" className="underline underline-offset-2 hover:text-stone-900">
              woodworking tools
            </Link>{' '}
            are free for everyone.
          </p>

          {message && (
            <p role="alert" className="mb-5 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          {/* A plain link, not <Link>: this hits a route handler that redirects off-site to Google. */}
          <a
            href={`/api/auth/google?next=${encodeURIComponent(next)}`}
            className="inline-flex w-full items-center justify-center gap-3 border border-stone-300 bg-white text-stone-800 px-5 py-3 rounded-lg font-semibold hover:bg-stone-50 transition-colors"
          >
            <GoogleIcon />
            Sign in with Google
          </a>
        </div>
      </main>
    </>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto text-stone-500" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
