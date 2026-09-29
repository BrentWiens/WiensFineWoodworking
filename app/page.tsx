import { Navigation, Footer, Hero, About, Testimonials, Contact } from '@/components';
// Not via the barrel: it reads the project registry, which would otherwise land in
// every page that imports from it.
import Featured from '@/components/Featured';

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
