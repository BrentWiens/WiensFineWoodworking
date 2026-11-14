import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
import PageHero from '@/components/PageHero';
import ToolGuide from '@/components/ToolGuide';
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
                <ToolGuide slug="board-feet-calculator">
                    <p>
                        A board foot is a measure of volume: a piece one inch thick, twelve inches wide and twelve
                        inches long, or 144 cubic inches. Hardwood is usually priced by it, so it is the number you
                        need before a trip to the lumber yard.
                    </p>
                    <p>
                        The formula is thickness × width × length ÷ 144, with everything in inches. Add a row for
                        each size of board, set the quantity, and the total at the top adds them up. Switch to metric
                        to enter millimetres instead; the answer is still in board feet.
                    </p>
                    <p>
                        Dimensions can be decimals or fractions, so 3/4 and 1-1/2 both work. Rough lumber is sold by
                        thickness in quarters of an inch, and you can type those directly: 4/4 is 1 inch, 5/4 is 1.25
                        and 8/4 is 2.
                    </p>
                    <h3>Waste and cost</h3>
                    <p>
                        You never get every inch out of a board. Knots, checks, sapwood and the offcuts left after
                        cutting parts to length all take their share, so enter a waste allowance to see how much to
                        actually buy. Add the price per board foot and the estimated cost is worked out on that larger
                        figure.
                    </p>
                </ToolGuide>
                <CommissionCta />

            </main>

            <Footer />
        </>
    );
}
