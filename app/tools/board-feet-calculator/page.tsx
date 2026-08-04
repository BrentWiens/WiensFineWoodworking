import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
import PageHero from '@/components/PageHero';
import BoardFeetCalculator from '@/components/BoardFeetCalculator/BoardFeetCalculator';

export const metadata: Metadata = {
    title: 'Board Feet Calculator | Wiens Fine Woodworking',
    description: 'Free board feet calculator for woodworking. Calculate lumber volume from thickness, width, and length measurements.',
    keywords: ['board feet calculator', 'lumber calculator', 'woodworking calculator', 'board foot', 'woodworking tools'],
    alternates: {
        canonical: '/tools/board-feet-calculator',
    },
    openGraph: {
        title: 'Board Feet Calculator | Wiens Fine Woodworking',
        description: 'Free board feet calculator for woodworking. Calculate lumber volume with ease.',
        images: TOOLS_OG_IMAGE,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Board Feet Calculator | Wiens Fine Woodworking',
        description: 'Free board feet calculator for woodworking',
        images: TOOLS_TWITTER_IMAGE,
    },
};

export default function BoardFeetCalculatorPage() {
    return (
        <>
            <Navigation />

            <main id="main-content" className="min-h-screen bg-stone-50">

                <PageHero
                    title="Board Feet Calculator"
                    subtitle="Calculate lumber volume in board feet from thickness, width, and length."
                    imageSrc="/handplanes.jpg"
                    imageAlt="Handplanes"
                    overlay="medium"
                />

                <div className="py-8 px-4">
                    <ErrorBoundary>
                        <BoardFeetCalculator />
                    </ErrorBoundary>
                </div>
                <CommissionCta />

            </main>

            <Footer />
        </>
    );
}
