'use client';

import { useState } from 'react';
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