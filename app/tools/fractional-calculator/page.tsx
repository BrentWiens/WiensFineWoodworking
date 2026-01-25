import { Metadata } from 'next';
import Image from 'next/image';
import { Navigation, Footer, ErrorBoundary } from '@/components';
import FractionalCalculator from '@/components/FractionalCalculator/FractionalCalculator';

export const metadata: Metadata = {
    title: 'Fractional Calculator | Wiens Fine Woodworking',
    description: 'Free fractional calculator for woodworking. Add, subtract, multiply, and divide fractions with common woodworking measurements like 1/8, 1/16, and 1/32.',
    keywords: ['fractional calculator', 'woodworking calculator', 'fraction calculator', 'imperial measurements', 'woodworking tools'],
    alternates: {
        canonical: '/tools/fractional-calculator',
    },
    openGraph: {
        title: 'Fractional Calculator | Wiens Fine Woodworking',
        description: 'Free fractional calculator for woodworking. Add, subtract, multiply, and divide fractions with ease.',
        images: [
            {
                url: '/images/handplanes.jpg',
                width: 1200,
                height: 630,
                alt: 'Fractional Calculator',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Fractional Calculator | Wiens Fine Woodworking',
        description: 'Free fractional calculator for woodworking',
        images: ['/images/handplanes.jpg'],
    },
};

export default function FractionalCalculatorPage() {
    return (
        <>
            <Navigation />

            <main className="min-h-screen pt-20 bg-stone-50">

                <div className="relative pt-30 pb-16 px-6">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/handplanes.jpg"
                            alt="Handplanes"
                            fill
                            className="object-cover"
                            priority
                            quality={60}
                        />
                        {/* Dark overlay for text readability */}
                        <div className="absolute inset-0 bg-black/40"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-7xl mx-auto">
                        <h1 className="text-5xl font-bold text-white mb-4 text-center drop-shadow-lg">
                            Fractional Calculator
                        </h1>
                        <p className="text-white/90 text-center text-lg max-w-2xl mx-auto drop-shadow-md">
                            A calculator designed for woodworking with imperial fractions.
                            Add, subtract, multiply, and divide measurements like 2-3/4&quot; easily.
                        </p>
                    </div>
                </div>

                <div className="py-8 px-4">
                    <ErrorBoundary>
                        <FractionalCalculator />
                    </ErrorBoundary>
                </div>
            </main>

            <Footer />
        </>
    );
}
