import { Metadata } from 'next';
import Image from 'next/image';
import { Navigation, Footer, ErrorBoundary } from '@/components';
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
        images: [
            {
                url: '/images/handplanes.jpg',
                width: 1200,
                height: 630,
                alt: 'Trigonometry Calculator',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Trigonometry Calculator | Wiens Fine Woodworking',
        description: 'Free trigonometry calculator for woodworking',
        images: ['/images/handplanes.jpg'],
    },
};

export default function TrigCalculatorPage() {
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
                            Trigonometry Calculator
                        </h1>
                        <p className="text-white/90 text-center text-lg max-w-2xl mx-auto drop-shadow-md">
                            Solve any right triangle. Enter two known measurements and calculate the rest.
                        </p>
                    </div>
                </div>

                <div className="py-8 px-4">
                    <ErrorBoundary>
                        <TrigCalculator />
                    </ErrorBoundary>
                </div>
            </main>

            <Footer />
        </>
    );
}
