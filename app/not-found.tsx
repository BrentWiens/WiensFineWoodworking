import Link from 'next/link';
import { Navigation, Footer } from '@/components';

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
        <div className="max-w-md text-center">
          <h1 className="text-8xl font-bold text-stone-300 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-stone-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-stone-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-stone-800 text-white px-6 py-3 rounded-lg hover:bg-stone-700 transition-colors font-semibold"
            >
              Go Home
            </Link>
            <Link
              href="/gallery"
              className="border border-stone-300 text-stone-700 px-6 py-3 rounded-lg hover:bg-stone-100 transition-colors font-semibold"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
