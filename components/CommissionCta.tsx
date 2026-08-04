import Link from 'next/link';

interface CommissionCtaProps {
  heading?: string;
  body?: string;
}

/**
 * Soft call to action for the free calculator pages.
 *
 * The tools bring in woodworkers rather than furniture buyers, so this is
 * deliberately low-key — it exists to catch the occasional visitor who decides the
 * project is bigger than they want to take on themselves.
 */
export default function CommissionCta({
  heading = 'Rather have it built for you?',
  body = 'I build custom tables, desks and cabinetry in Kitchener, Ontario. Have a look at what I have made, or get in touch about your project.',
}: CommissionCtaProps) {
  return (
    <section className="px-4 pb-12 no-print">
      <div className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-3">{heading}</h2>
        <p className="text-stone-600 mb-6 max-w-xl mx-auto">{body}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/gallery"
            className="inline-block bg-stone-800 text-white px-6 py-3 rounded-lg hover:bg-stone-700 transition-colors font-semibold"
          >
            View the Gallery
          </Link>
          <Link
            href="/#contact"
            className="inline-block bg-white text-stone-800 border-2 border-stone-800 px-6 py-3 rounded-lg hover:bg-stone-100 transition-colors font-semibold"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  );
}
