'use client';

import { useState, useRef, useEffect } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import SocialLinks from './SocialLinks';

// How long to wait for the Turnstile widget to appear before assuming it never
// will. It normally renders in a second or two; if challenges.cloudflare.com is
// blocked the script fails silently and no callback ever fires, which would
// otherwise leave the submit button disabled forever with nothing explaining why.
const WIDGET_LOAD_TIMEOUT_MS = 12_000;

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  // True once the form has become a dead end — the send failed, or the captcha
  // could not load at all. Not set for the ordinary "you haven't done the captcha
  // yet" nudge, which the visitor can simply resolve themselves.
  const [showSocialFallback, setShowSocialFallback] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  useEffect(() => {
    if (widgetReady) return;
    const timer = setTimeout(() => setShowSocialFallback(true), WIDGET_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [widgetReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) return;

    if (!turnstileToken) {
      setStatus('error');
      setShowSocialFallback(false);
      setErrorMessage('Please complete the verification');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    setShowSocialFallback(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          website: honeypot,
          turnstileToken
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', city: '', message: '' });
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch (error) {
      setStatus('error');
      // The message did not get through, so give people another way to reach me
      // rather than letting the enquiry die here.
      setShowSocialFallback(true);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="contact-form" className="max-w-2xl mx-auto space-y-6">
      {/* Honeypot field - hidden from humans, catches bots */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-stone-700 font-medium mb-2">
          Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none text-stone-900 placeholder:text-stone-500"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-stone-700 font-medium mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none text-stone-900 placeholder:text-stone-500"
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-stone-700 font-medium mb-2">
          Phone *
        </label>
        <input
          type="tel"
          id="phone"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none text-stone-900 placeholder:text-stone-500"
          placeholder="(555) 123-4567"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-stone-700 font-medium mb-2">
          City *
        </label>
        <input
          type="text"
          id="city"
          required
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none text-stone-900 placeholder:text-stone-500"
          placeholder="Your city"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-stone-700 font-medium mb-2">
          Message *
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none resize-y text-stone-900 placeholder:text-stone-500"
          placeholder="Tell me about your project..."
        />
      </div>

      {/* Turnstile Widget */}
      <div className="flex justify-center">
        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onWidgetLoad={() => setWidgetReady(true)}
          onSuccess={(token) => setTurnstileToken(token)}
          onError={() => {
            setStatus('error');
            // The widget loaded but the challenge itself failed, so the visitor
            // still cannot get a message through this form.
            setShowSocialFallback(true);
            setErrorMessage('Verification failed. Please try again.');
          }}
          onExpire={() => setTurnstileToken(null)}
        />
      </div>

      <button
        type="submit"
        data-testid="contact-submit"
        disabled={status === 'loading' || !turnstileToken}
        className="w-full bg-stone-800 text-white px-8 py-3 rounded-lg hover:bg-stone-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>

      {/* aria-live so the outcome is announced. Without it a screen reader user
          submits the form and hears nothing at all. */}
      <div role="status" aria-live="polite">
        {status === 'success' && (
          <div data-testid="contact-success" className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-center font-medium">
              ✓ Message sent successfully! I&apos;ll get back to you within 24 hours.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div data-testid="contact-error" className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-center font-medium">
              {errorMessage}
            </p>
          </div>
        )}
      </div>

      {/* Rendered outside the error box on purpose: the worst case is the captcha
          silently never loading, where there is no error to report but the form is
          still unusable. Wording stays neutral so it reads correctly whether the
          send failed or verification never appeared. */}
      {showSocialFallback && (
        <div
          data-testid="contact-error-social"
          className="p-4 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <p className="text-amber-900 text-center mb-4">
            Having trouble with this form? Send me a message on Facebook or Instagram
            instead and I&apos;ll get right back to you.
          </p>
          <SocialLinks className="justify-center" />
        </div>
      )}
    </form>
  );
}