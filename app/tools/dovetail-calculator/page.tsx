import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
import PageHero from '@/components/PageHero';
import ToolGuide from '@/components/ToolGuide';
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
                <ToolGuide slug="dovetail-calculator">
                    <p>
                        Enter the width and thickness of your stock and how many tails you want. The joint is divided
                        evenly across the board, with a half pin at each edge, and both boards are drawn with every
                        part dimensioned so you can transfer the layout straight to the wood.
                    </p>
                    <p>
                        To change the proportions, enter a width for the tails or the pins and the other is worked out
                        to fill the board. Enter both to set the spacing yourself. The top and bottom offsets leave
                        part of the edge out of the joint, for a groove, a rabbet or a lid that will be sawn off
                        later.
                    </p>
                    <h3>Choosing an angle</h3>
                    <p>
                        The slope is given as a ratio. 1:8, about 7°, is the usual choice for hardwoods, and 1:6,
                        about 9.5°, for softwoods, which crush more easily and need the extra grip. 1:4 is steeper
                        again and suits thin stock or a bolder look. Choose the box joint option for square fingers
                        instead.
                    </p>
                </ToolGuide>
                <CommissionCta />

            </main>

            <Footer />
        </>
    );
}