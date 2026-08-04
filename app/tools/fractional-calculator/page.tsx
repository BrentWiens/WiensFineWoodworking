import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import Image from 'next/image';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
import FractionalCalculator from '@/components/FractionalCalculator/FractionalCalculator';

export const metadata: Metadata = {
    title: 'Fractional Calculator | Wiens Fine Woodworking',
    description: 'Free fractional calculator for woodworking. Add, subtract, multiply, and divide fractions with common woodworking measurements like 1/8, 1/16, and 1/32.',
    keywords: ['fractional calculator', 'woodworking calculator', 'fraction calculator', 'woodworking tools'],
    alternates: {
        canonical: '/tools/fractional-calculator',
    },
    openGraph: {
        title: 'Fractional Calculator | Wiens Fine Woodworking',
        description: 'Free fractional calculator for woodworking. Add, subtract, multiply, and divide fractions with ease.',
        images: TOOLS_OG_IMAGE,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Fractional Calculator | Wiens Fine Woodworking',
        description: 'Free fractional calculator for woodworking',
        images: TOOLS_TWITTER_IMAGE,
    },
};

export default function FractionalCalculatorPage() {
    return (
        <>
            <Navigation />

            <main id="main-content" className="min-h-screen bg-stone-50">

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
                            A calculator designed for working with fractions.
                            Add, subtract, multiply, and divide measurements like 2-3/4 easily.
                        </p>
                    </div>
                </div>

                <div className="py-8 px-4">
                    <ErrorBoundary>
                        <FractionalCalculator />
                    </ErrorBoundary>
                </div>
                <CommissionCta />

            </main>

            <Footer />
        </>
    );
}
