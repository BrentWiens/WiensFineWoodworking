import { Navigation, Footer, Hero, Featured, About, Testimonials, Contact } from '@/components';

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