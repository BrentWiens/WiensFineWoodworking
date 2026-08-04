import { Navigation, Footer, Hero, Featured, About, Testimonials, Contact } from '@/components';

// These were previously wrapped in next/dynamic. Featured, About and Testimonials
// are Server Components — they ship no client JS, so there was nothing to split out,
// and the loading placeholders only added layout shift. Contact is the one client
// component here; its weight (the Turnstile widget) is deferred inside Contact.tsx
// instead, where it can be loaded on demand rather than on page load.
export default function Home() {
  return (
    <>
      <Navigation />

      <main id="main-content" className="min-h-screen">
        <Hero />
        <Featured />
        <About />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
    </>
  );
}