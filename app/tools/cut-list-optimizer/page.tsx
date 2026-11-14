import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
import PageHero from '@/components/PageHero';
import ToolGuide from '@/components/ToolGuide';
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
                <ToolGuide slug="cut-list-optimizer">
                    <p>
                        Start with the sheet: its size, the width of your saw blade&apos;s kerf, and how many sheets
                        you have. A full sheet of plywood is 48 × 96 inches, or 1220 × 2440 mm. Then add each part
                        with its length, width and quantity, and a name if you want one on the drawing. Dimensions can
                        be decimals or fractions such as 23 1/2.
                    </p>
                    <p>
                        The optimizer lays the parts out nine different ways and keeps the layout that fits the most
                        parts on the fewest sheets. The kerf is left between neighbouring parts, so the sizes you get
                        are the sizes you asked for. If the parts will not all fit, it tells you how many sheets the
                        whole job needs.
                    </p>
                    <h3>Grain direction</h3>
                    <p>
                        The grain of a sheet runs along its length. For each part you can keep its length running with
                        the grain, turn it so its width does, or leave the choice open. Leaving it open lets the
                        optimizer rotate the part to wherever it fits best, which wastes less. Fix the direction on
                        the parts that will be seen side by side, like doors and drawer fronts.
                    </p>
                    <h3>Before you cut</h3>
                    <p>
                        The result is a good layout found quickly, not a guaranteed best one, and some layouts cannot
                        be cut with edge-to-edge passes alone. Work out your order of cuts before the first one. Your
                        list is saved in this browser, and the cut list and drawings can be printed to take to the
                        shop.
                    </p>
                </ToolGuide>
                <CommissionCta />

            </main>

            <Footer />
        </>
    );
}
