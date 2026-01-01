import Navigation from '@/components/Navigation';
import GalleryWrapper from '@/components/GalleryWrapper';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/gallery/handplanes.jpg"
              alt="Hand planes"
              fill
              className="object-cover"
              priority
              quality={90}
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Content - now with z-10 to appear above background */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              WIENS Fine Woodworking
            </h1>
            <p className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow-md">
              Handcrafted furniture and custom woodworking projects built with precision and care
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="#gallery"
                className="bg-white text-stone-800 px-8 py-3 rounded-lg hover:bg-stone-100 transition-colors font-semibold shadow-lg"
              >
                View Gallery
              </a>
              <a
                href="#contact"
                className="bg-stone-800/90 text-white px-8 py-3 rounded-lg hover:bg-stone-900 transition-colors font-semibold border-2 border-white shadow-lg backdrop-blur-sm"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </section>

        <GalleryWrapper />

        {/* About Section */}
        <section id="about" className="py-20 px-6 bg-stone-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-stone-800 mb-8 text-center">
              About WIENS Fine Woodworking
            </h2>

            <div className="prose prose-lg prose-stone mx-auto">
              <p className="text-stone-700 text-lg leading-relaxed mb-6">
                Welcome to WIENS Fine Woodworking, where traditional craftsmanship meets modern design.
                Every piece I create is built with meticulous attention to detail, quality materials,
                and a passion for the timeless art of woodworking.
              </p>

              <p className="text-stone-700 text-lg leading-relaxed mb-6">
                From custom furniture to unique handcrafted pieces, each project is an opportunity
                to bring your vision to life. I work closely with clients to ensure every detail
                matches their needs and exceeds their expectations.
              </p>

              <p className="text-stone-700 text-lg leading-relaxed mb-6">
                Whether you're looking for a statement piece for your home, a custom gift, or
                functional furniture built to last generations, I'm here to help create something
                truly special.
              </p>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 mt-8">
                <h3 className="text-2xl font-semibold text-stone-800 mb-4">What I Offer</h3>
                <ul className="space-y-3 text-stone-700">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-stone-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Custom furniture design and build</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-stone-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Handcrafted cutting boards and kitchen items</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-stone-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Restoration and refinishing of heirloom pieces</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-stone-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>One-of-a-kind gifts and home decor</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-stone-800 mb-4">
              Let's Work Together
            </h2>
            <p className="text-stone-600 mb-12 text-lg">
              Have a custom project in mind? Get in touch to discuss your woodworking needs.
            </p>

            {/* Social Links */}
            <div className="flex gap-6 justify-center items-center">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/people/Wiens-Fine-Woodworking/61559807342865"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-stone-100 hover:bg-stone-200 px-6 py-3 rounded-lg transition-colors group"
              >
                <svg
                  className="w-6 h-6 text-stone-700 group-hover:text-stone-900 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="font-semibold text-stone-800">Facebook</span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/wiensfinewoodworking/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-stone-100 hover:bg-stone-200 px-6 py-3 rounded-lg transition-colors group"
              >
                <svg
                  className="w-6 h-6 text-stone-700 group-hover:text-stone-900 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span className="font-semibold text-stone-800">Instagram</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}