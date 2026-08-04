import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
import PageHero from '@/components/PageHero';
import TrigCalculator from '@/components/TrigCalculator/TrigCalculator';

export const metadata: Metadata = {
    title: 'Trigonometry Calculator | Wiens Fine Woodworking',
    description: 'Free right triangle calculator for woodworking. Enter any two measurements to solve for all sides and angles. Supports fractional input for precise calculations.',
    keywords: ['trigonometry calculator', 'right triangle calculator', 'woodworking calculator', 'angle calculator', 'miter angle', 'woodworking tools'],
    alternates: {
        canonical: '/tools/trig-calculator',
    },
    openGraph: {
        title: 'Trigonometry Calculator | Wiens Fine Woodworking',
        description: 'Free right triangle calculator. Enter any two measurements to solve for all sides and angles.',
        images: TOOLS_OG_IMAGE,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Trigonometry Calculator | Wiens Fine Woodworking',
        description: 'Free trigonometry calculator for woodworking',
        images: TOOLS_TWITTER_IMAGE,
    },
};

export default function TrigCalculatorPage() {
    return (
        <>
            <Navigation />

            <main id="main-content" className="min-h-screen bg-stone-50">

                <PageHero
                    title="Trigonometry Calculator"
                    subtitle="Solve any right triangle. Enter two known measurements and calculate the rest."
                    imageSrc="/handplanes.jpg"
                    imageAlt="Handplanes"
                    overlay="medium"
                />

                <div className="py-8 px-4">
                    <ErrorBoundary>
                        <TrigCalculator />
                    </ErrorBoundary>
                </div>
                <CommissionCta />

            </main>

            <Footer />
        </>
    );
}
