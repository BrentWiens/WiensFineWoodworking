'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SocialLinks from './SocialLinks';

// The form pulls in the Cloudflare Turnstile widget, which nobody needs until they
// actually click through to it. Splitting it out keeps that weight off first load.
const ContactForm = dynamic(() => import('./ContactForm'), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto py-12 text-center text-stone-500">Loading form…</div>
  ),
});

export default function Contact() {
  const [showForm, setShowForm] = useState(false);

  // Every "Contact" / "Get in Touch" / "Start a Commission" button points at #contact,
  // and someone who clicked one has already said they want to write — so open the
  // form for them rather than making them click "Send Me a Message" as well.
  useEffect(() => {
    const isContactLink = (url: URL) =>
      url.hash === '#contact' && url.pathname === window.location.pathname;

    // Arriving from another page (e.g. a project page's "Start a Commission"), or a
    // click that landed before hydration and fell through to a native jump.
    const openIfAtContact = () => {
      if (isContactLink(new URL(window.location.href))) setShowForm(true);
    };
    openIfAtContact();
    window.addEventListener('hashchange', openIfAtContact);

    // Same-page clicks. Next's <Link> updates the URL with pushState, which fires no
    // hashchange, and a click while the URL is already at #contact changes nothing —
    // so neither of those can be caught from the URL. Watch the clicks instead.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]');
      if (link instanceof HTMLAnchorElement && isContactLink(new URL(link.href))) {
        setShowForm(true);
      }
    };
    document.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('hashchange', openIfAtContact);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <section id="contact" className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-stone-800 mb-4 text-center">
          Let&apos;s Work Together
        </h2>
        <p className="text-stone-600 mb-12 text-lg text-center">
          Have a custom project in mind? Get in touch to discuss your woodworking needs.
        </p>

        {!showForm ? (
          /* Initial view - button and social links */
          <div className="space-y-8">
            {/* Contact button */}
            <div className="flex justify-center">
              <button
                data-testid="contact-show-form"
                onClick={() => setShowForm(true)}
                className="bg-stone-800 text-white px-10 py-4 rounded-lg hover:bg-stone-700 transition-colors font-semibold text-lg shadow-lg"
              >
                Send Me a Message
              </button>
            </div>

            {/* Social Links */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-8 border-t border-stone-200">
              <p className="text-stone-600 font-medium">Or connect on social media:</p>
              <SocialLinks />
            </div>
          </div>
        ) : (
          /* Form view - only loads when clicked */
          <div className="space-y-8">
            <ContactForm />
            
            <div className="text-center">
              <button
                onClick={() => setShowForm(false)}
                className="text-stone-600 hover:text-stone-800 transition-colors text-sm underline"
              >
                ← Back to contact options
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}