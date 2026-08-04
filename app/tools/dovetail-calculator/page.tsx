import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import Image from 'next/image';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
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

                <div className="relative pt-30 pb-16 px-6">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/dovetail-calculator/box-dovetails-cherry-maple-walnut.jpg"
                            alt="Dovetail box"
                            fill
                            className="object-cover object-[center_65%]"
                            priority
                            quality={60}
                        />
                        {/* Dark overlay for text readability */}
                        <div className="absolute inset-0 bg-black/30"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-7xl mx-auto">
                        <h1 className="text-5xl font-bold text-white mb-4 text-center drop-shadow-lg">
                            Dovetail Joint Calculator
                        </h1>
                        <p className="text-white/90 text-center text-lg max-w-2xl mx-auto drop-shadow-md">
                            Plan your dovetail joints with precision. Visualize how your pieces will fit together
                            and experiment with different pin angles and spacing.
                        </p>
                    </div>
                </div>
                <ErrorBoundary>
                    <DovetailVisualizer />
                </ErrorBoundary>
                <CommissionCta />

            </main>

            <Footer />
        </>
    );
}