import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
import PageHero from '@/components/PageHero';
import ToolGuide from '@/components/ToolGuide';
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
        images: TOOLS_OG_IMAGE,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Trigonometry Calculator | Wiens Fine Woodworking',
        description: 'Free trigonometry calculator for woodworking',
        images: TOOLS_TWITTER_IMAGE,
    },
};

export default function TrigCalculatorPage() {
    return (
        <>
            <Navigation />

            <main id="main-content" className="min-h-screen bg-stone-50">

                <PageHero
                    title="Trigonometry Calculator"
                    subtitle="Solve any right triangle. Enter two known measurements and calculate the rest."
                    imageSrc="/handplanes.jpg"
                    imageAlt="Handplanes"
                    overlay="medium"
                />

                <div className="py-8 px-4">
                    <ErrorBoundary>
                        <TrigCalculator />
                    </ErrorBoundary>
                </div>
                <ToolGuide slug="trig-calculator">
                    <p>
                        A right triangle has one 90° corner. Sides a and b meet at that corner, and side c, the
                        hypotenuse, is the long one opposite it. Angle A is the corner opposite side a, and angle B
                        the corner opposite side b. The two always add up to 90°.
                    </p>
                    <p>
                        Enter any two values, as long as at least one is a side, and press Calculate. The rest are
                        filled in and shaded so you can tell them from what you typed. Change a value and calculate
                        again to try something else. Sides can be decimals or fractions such as 3-1/2, and each
                        solved side is also shown to the nearest 1/64.
                    </p>
                    <h3>Where it helps in the shop</h3>
                    <p>
                        Most angled work comes down to a right triangle. With the rise and run of a tapered leg or a
                        sloped top you get the angle to set on the saw. With two sides of a frame you get the length
                        of a diagonal brace. And the diagonal of a cabinet tells you whether it is square: a case 30
                        by 40 should measure 50 corner to corner.
                    </p>
                </ToolGuide>
                <CommissionCta />

            </main>

            <Footer />
        </>
    );
}
