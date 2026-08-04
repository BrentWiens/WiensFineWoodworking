import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
import PageHero from '@/components/PageHero';
import DovetailVisualizer from '@/components/DovetailVisualizer/DovetailVisualizer';

export const metadata: Metadata = {
    title: 'Dovetail & Box Joint Calculator | Wiens Fine Woodworking',
    description: 'Free dovetail and box joint calculator with visualizer. Plan dovetail or box joints with custom dimensions, pin angles, finger spacing, and more.',
    keywords: ['dovetail calculator', 'box joint calculator', 'woodworking tools', 'dovetail joint', 'box joint', 'finger joint', 'woodworking calculator'],
    alternates: {
        canonical: '/tools/dovetail-calculator',
    },
    openGraph: {
        title: 'Dovetail & Box Joint Calculator | Wiens Fine Woodworking',
        description: 'Free dovetail and box joint calculator with visualizer. Plan dovetail or box joints with custom dimensions, angles, and spacing.',
        images: TOOLS_OG_IMAGE,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Dovetail & Box Joint Calculator | Wiens Fine Woodworking',
        description: 'Free dovetail and box joint calculator with visualizer',
        images: TOOLS_TWITTER_IMAGE,
    },
};

export default function DovetailCalculatorPage() {
    return (
        <>
            <Navigation />

            <main id="main-content" className="min-h-screen bg-stone-50">

                <PageHero
                    title="Dovetail Joint Calculator"
                    subtitle="Plan your dovetail joints with precision. Visualize how your pieces will fit together and experiment with different pin angles and spacing."
                    imageSrc="/images/dovetail-calculator/box-dovetails-cherry-maple-walnut.jpg"
                    imageAlt="Dovetail box"
                    imagePosition="object-[center_65%]"
                    overlay="light"
                />
                <ErrorBoundary>
                    <DovetailVisualizer />
                </ErrorBoundary>
                <CommissionCta />

            </main>

            <Footer />
        </>
    );
}