import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
import PageHero from '@/components/PageHero';
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

                <PageHero
                    title="Fractional Calculator"
                    subtitle="A calculator designed for working with fractions. Add, subtract, multiply, and divide measurements like 2-3/4 easily."
                    imageSrc="/handplanes.jpg"
                    imageAlt="Handplanes"
                    overlay="medium"
                />

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
