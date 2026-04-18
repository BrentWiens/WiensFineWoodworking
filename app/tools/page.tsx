import { Metadata } from 'next';
import Image from 'next/image';
import { Navigation, Footer, ToolCard } from '@/components';

export const metadata: Metadata = {
    title: 'Tools | Wiens Fine Woodworking',
    description: 'Free woodworking tools and calculators. Plan dovetail joints, calculate board feet, and optimize cut lists for your projects.',
    alternates: {
        canonical: '/tools',
    },
    openGraph: {
        title: 'Tools | Wiens Fine Woodworking',
        description: 'Free woodworking tools and calculators for your projects',
        images: [
            {
                url: '/images/handplanes.jpg',
                width: 1200,
                height: 630,
                alt: 'Wiens Fine Woodworking Tools',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tools | Wiens Fine Woodworking',
        description: 'Free woodworking tools and calculators for your projects',
        images: ['/images/handplanes.jpg'],
    },
};

const TOOLS = [
    {
        href: '/tools/fractional-calculator',
        title: 'Fractional Calculator',
        description: 'A convenient fractional calculator. Add, subtract, multiply, and divide fractions with ease.',
        imageSrc: '/images/fractional-calculator/fractional-calculator-preview.png',
        imageAlt: 'Fractional calculator preview',
    },
    {
        href: '/tools/board-feet-calculator',
        title: 'Board Feet Calculator',
        description: 'Calculate lumber volume in board feet from thickness, width, and length.',
        imageSrc: '/images/board-feet-calculator/board-feet-calculator-preview.png',
        imageAlt: 'Board feet calculator preview',
        imageObjectPosition: 'top' as const,
    },
    {
        href: '/tools/cut-list-optimizer',
        title: 'Cut List Optimizer',
        description: 'Optimize plywood cuts to minimize waste. Supports grain direction for consistent appearance.',
        imageSrc: '/images/cut-list-optimizer/cut-list-optimizer-preview.png',
        imageAlt: 'Cut list optimizer preview',
        imageObjectPosition: 'top' as const,
    },
    {
        href: '/tools/trig-calculator',
        title: 'Trigonometry Calculator',
        description: 'Solve any right triangle. Enter two known sides or angles to calculate the rest. Supports fractional input.',
        imageSrc: '/images/trigonometry-calculator/trig-calculator.png',
        imageAlt: 'Trigonometry calculator preview',
    },
    {
        href: '/tools/dovetail-calculator',
        title: 'Dovetail Joint Calculator',
        description: 'Visualize and plan your dovetail joints with custom dimensions, pin angles, and spacing.',
        imageSrc: '/images/dovetail-calculator/dovetail-calculator-preview.png',
        imageAlt: 'Dovetail joint preview',
        imageObjectPosition: 'top' as const,
    },
];

export default function ToolsPage() {
    return (
        <>
            <Navigation />

            <main id="main-content" className="min-h-screen bg-stone-50">
                {/* Hero header with background - now starts at top */}
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
                        <div className="absolute inset-0 bg-black/50"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-7xl mx-auto">
                        <h1 className="text-5xl font-bold text-white mb-4 text-center drop-shadow-lg">
                            Tools
                        </h1>
                        <p className="text-white/90 text-center text-lg max-w-2xl mx-auto drop-shadow-md">
                            A collection of tools used in woodworking design and craftsmanship.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TOOLS.map(tool => (
                            <ToolCard key={tool.href} {...tool} />
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
