import { Navigation, Footer, Hero, About, Contact, Featured, Testimonials } from '@/components';

export default function Home() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen">
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