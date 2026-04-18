import dynamic from 'next/dynamic';
import { Navigation, Footer, Hero } from '@/components';

// Lazy load below-the-fold components for faster initial page load
const Featured = dynamic(() => import('@/components/Featured'), {
  loading: () => <div className="min-h-[400px]" />,
});

const About = dynamic(() => import('@/components/About'), {
  loading: () => <div className="min-h-[400px]" />,
});

const Testimonials = dynamic(() => import('@/components/Testimonials'), {
  loading: () => <div className="min-h-[300px]" />,
});

const Contact = dynamic(() => import('@/components/Contact'), {
  loading: () => <div className="min-h-[200px]" />,
});

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