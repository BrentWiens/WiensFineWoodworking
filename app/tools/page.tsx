import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import { Navigation, Footer, ToolCard } from '@/components';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
    title: 'Tools | Wiens Fine Woodworking',
    description: 'Free woodworking tools and calculators. Plan dovetail joints, calculate board feet, and optimize cut lists for your projects.',
    alternates: {
        canonical: '/tools',
    },
    openGraph: {
        title: 'Tools | Wiens Fine Woodworking',
        description: 'Free woodworking tools and calculators for your projects',
        images: TOOLS_OG_IMAGE,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tools | Wiens Fine Woodworking',
        description: 'Free woodworking tools and calculators for your projects',
        images: TOOLS_TWITTER_IMAGE,
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
                <PageHero
                    title="Tools"
                    subtitle="A collection of tools used in woodworking design and craftsmanship."
                    imageSrc="/handplanes.jpg"
                    imageAlt="Handplanes"
                    overlay="dark"
                />

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
