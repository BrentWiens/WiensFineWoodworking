import { Metadata } from 'next';
import Image from 'next/image';
import { Navigation, Footer, ErrorBoundary } from '@/components';
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
        images: [
            {
                url: '/images/handplanes.jpg',
                width: 1200,
                height: 630,
                alt: 'Cut List Optimizer',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cut List Optimizer | Wiens Fine Woodworking',
        description: 'Free cut list optimizer for plywood and sheet goods',
        images: ['/images/handplanes.jpg'],
    },
};

export default function CutListOptimizerPage() {
    return (
        <>
            <Navigation />

            <main className="min-h-screen bg-stone-50">

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
                            Cut List Optimizer
                        </h1>
                        <p className="text-white/90 text-center text-lg max-w-2xl mx-auto drop-shadow-md">
                            Optimize your plywood cuts to minimize waste. Supports grain direction for consistent appearance.
                        </p>
                    </div>
                </div>

                <div className="py-8 px-4">
                    <ErrorBoundary>
                        <CutListOptimizer />
                    </ErrorBoundary>
                </div>
            </main>

            <Footer />
        </>
    );
}
