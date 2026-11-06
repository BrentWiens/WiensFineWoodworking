import { Metadata } from 'next';
import Link from 'next/link';
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

// Everything here lives under /tools/business and requires Google sign-in (see proxy.ts).
// Deliberately absent from the sitemap and the service worker's precache.
const BUSINESS_TOOLS = [
    {
        href: '/tools/business/mileage',
        title: 'Mileage Log',
        description: 'Log business trips from the road and get the year-end business-use percentage for the vehicle claim.',
        icon: (
            <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 17h14M6.5 17l1.6-5.2A2 2 0 0 1 10 10.4h4a2 2 0 0 1 1.9 1.4L17.5 17" />
                <path d="M4 17v2.5M20 17v2.5" />
                <circle cx="8" cy="14.5" r="0.75" fill="currentColor" />
                <circle cx="16" cy="14.5" r="0.75" fill="currentColor" />
                <path d="M12 3v2M12 7.5v.5" />
            </svg>
        ),
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

                    <section id="business-tools" aria-labelledby="business-tools-heading" className="mt-16 scroll-mt-32">
                        <h2 id="business-tools-heading" className="text-2xl font-bold text-stone-800 mb-1">
                            Business tools
                        </h2>
                        <p className="text-stone-600 mb-6 max-w-2xl">
                            Tools I&apos;m building to run the business side of the shop, like mileage, expenses and
                            invoicing. They&apos;re private while I test them. If you&apos;d like access,{' '}
                            <Link href="/#contact" className="underline underline-offset-2 hover:text-stone-900">
                                get in touch
                            </Link>
                            .
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {BUSINESS_TOOLS.map(tool => (
                                <ToolCard key={tool.href} {...tool} locked />
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}
