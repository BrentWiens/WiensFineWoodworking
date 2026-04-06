import { Metadata } from 'next';
import Image from 'next/image';
import { Navigation, GalleryWrapper, Footer } from '@/components';

export const metadata: Metadata = {
    title: 'Gallery | Wiens Fine Woodworking',
    description: 'Browse custom tables and desks handcrafted in Kitchener, Ontario — dining tables, coffee tables, end tables, desks, and more.',
    alternates: {
        canonical: '/gallery',
    },
    openGraph: {
        title: 'Gallery | Wiens Fine Woodworking',
        description: 'Browse custom tables and desks handcrafted in Kitchener, Ontario',
        images: [
            {
                url: '/images/coffee-table-walnut-angled.jpg',
                alt: 'Wiens Fine Woodworking Gallery',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Gallery | Wiens Fine Woodworking',
        description: 'Browse custom tables and desks handcrafted in Kitchener, Ontario',
        images: ['/images/coffee-table-walnut-angled.jpg'],
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
                            src="/coffee-table-walnut-angled.jpg"
                            alt="Coffee table"
                            fill
                            className="object-cover object-top"
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
                            Built with precision,
                            quality materials, and the craftsmanship to last a lifetime.
                        </p>
                    </div>
                </div>

                <GalleryWrapper />
            </main>

            <Footer />
        </>
    );
}