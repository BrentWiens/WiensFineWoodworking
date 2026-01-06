import { Navigation, Footer, Hero, About, Contact, Featured, InstagramFeed, Testimonials } from '@/components';

export default function Home() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        <Hero />
        <Featured />
        <About />
        <Contact />
      </main>

      <Footer />
    </>
  );
}