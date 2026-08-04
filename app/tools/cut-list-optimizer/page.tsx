import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
import PageHero from '@/components/PageHero';
import CutListOptimizer from '@/components/CutListOptimizer/CutListOptimizer';

export const metadata: Metadata = {
    title: 'Cut List Optimizer | Wiens Fine Woodworking',
    description: 'Free cut list optimizer for plywood and sheet goods. Minimize waste by optimizing piece placement with grain direction support.',
    keywords: ['cut list optimizer', 'plywood calculator', 'sheet goods calculator', 'woodworking optimizer', 'cut optimization', 'minimize waste'],
    alternates: {
        canonical: '/tools/cut-list-optimizer',
    },
    openGraph: {
        title: 'Cut List Optimizer | Wiens Fine Woodworking',
        description: 'Free cut list optimizer for plywood. Minimize waste with grain direction support.',
        images: TOOLS_OG_IMAGE,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cut List Optimizer | Wiens Fine Woodworking',
        description: 'Free cut list optimizer for plywood and sheet goods',
        images: TOOLS_TWITTER_IMAGE,
    },
};

export default function CutListOptimizerPage() {
    return (
        <>
            <Navigation />

            <main id="main-content" className="min-h-screen bg-stone-50">

                <PageHero
                    title="Cut List Optimizer"
                    subtitle="Optimize your plywood cuts to minimize waste. Supports grain direction for consistent appearance."
                    imageSrc="/handplanes.jpg"
                    imageAlt="Handplanes"
                    overlay="medium"
                />

                <div className="py-8 px-4">
                    <ErrorBoundary>
                        <CutListOptimizer />
                    </ErrorBoundary>
                </div>
                <CommissionCta />

            </main>

            <Footer />
        </>
    );
}
