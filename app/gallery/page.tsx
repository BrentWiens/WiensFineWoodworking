import { Metadata } from 'next';
import Image from 'next/image';
import { Navigation, GalleryWrapper, Footer } from '@/components';

export const metadata: Metadata = {
    title: 'Gallery | Wiens Fine Woodworking',
    description: 'Browse our complete collection of custom furniture, cutting boards, and handcrafted wood projects. Quality craftsmanship from Kitchener, Ontario.',
    openGraph: {
        title: 'Gallery | Wiens Fine Woodworking',
        description: 'Browse our complete collection of custom furniture and handcrafted wood projects',
    },
};

export default function GalleryPage() {
    return (
        <>
            <Navigation />

            <main className="min-h-screen">
                {/* Hero header with background - now starts at top */}
                <div className="relative pt-30 pb-16 px-6">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/handplanes.jpg"
                            alt="Workshop background"
                            fill
                            className="object-cover"
                            priority
                            quality={60}
                        />
                        {/* Dark overlay for text readability */}
                        <div className="absolute inset-0 bg-black/50"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-7xl mx-auto">
                        <h1 className="text-5xl font-bold text-white mb-4 text-center drop-shadow-lg">
                            Project Gallery
                        </h1>
                        <p className="text-white/90 text-center text-lg max-w-2xl mx-auto drop-shadow-md">
                            Explore our collection of custom furniture, cutting boards, and unique handcrafted pieces.
                            Each project is built with precision, care, and quality materials.
                        </p>
                    </div>
                </div>

                <GalleryWrapper />
            </main>

            <Footer />
        </>
    );
}