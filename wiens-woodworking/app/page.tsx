import { Navigation, GalleryWrapper, Footer, Hero, About, Contact } from '@/components';

export default function Home() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        <Hero />
        <GalleryWrapper />
        <About />
        <Contact />
      </main>

      <Footer />
    </>
  );
}