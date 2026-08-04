import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import Image from 'next/image';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
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
                            Board Feet Calculator
                        </h1>
                        <p className="text-white/90 text-center text-lg max-w-2xl mx-auto drop-shadow-md">
                            Calculate lumber volume in board feet from thickness, width, and length.
                        </p>
                    </div>
                </div>

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
