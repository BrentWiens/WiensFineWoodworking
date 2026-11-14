import { Metadata } from 'next';
import { TOOLS_OG_IMAGE, TOOLS_TWITTER_IMAGE } from '@/lib/metadata';
import { Navigation, Footer, ErrorBoundary, CommissionCta } from '@/components';
import PageHero from '@/components/PageHero';
import ToolGuide from '@/components/ToolGuide';
import FractionalCalculator from '@/components/FractionalCalculator/FractionalCalculator';

export const metadata: Metadata = {
    title: 'Fractional Calculator | Wiens Fine Woodworking',
    description: 'Free fractional calculator for woodworking. Add, subtract, multiply, and divide fractions with common woodworking measurements like 1/8, 1/16, and 1/32.',
    keywords: ['fractional calculator', 'woodworking calculator', 'fraction calculator', 'woodworking tools'],
    alternates: {
        canonical: '/tools/fractional-calculator',
    },
    openGraph: {
        title: 'Fractional Calculator | Wiens Fine Woodworking',
        description: 'Free fractional calculator for woodworking. Add, subtract, multiply, and divide fractions with ease.',
        images: TOOLS_OG_IMAGE,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Fractional Calculator | Wiens Fine Woodworking',
        description: 'Free fractional calculator for woodworking',
        images: TOOLS_TWITTER_IMAGE,
    },
};

export default function FractionalCalculatorPage() {
    return (
        <>
            <Navigation />

            <main id="main-content" className="min-h-screen bg-stone-50">

                <PageHero
                    title="Fractional Calculator"
                    subtitle="A calculator designed for working with fractions. Add, subtract, multiply, and divide measurements like 2-3/4 easily."
                    imageSrc="/handplanes.jpg"
                    imageAlt="Handplanes"
                    overlay="medium"
                />

                <div className="py-8 px-4">
                    <ErrorBoundary>
                        <FractionalCalculator />
                    </ErrorBoundary>
                </div>
                <ToolGuide slug="fractional-calculator">
                    <p>
                        Each number goes in on three pads: one for the whole number, and one each for the top and
                        bottom of the fraction. To enter 2-3/4, tap 2 on the first pad, 3 on the second and 4 on the
                        third. Press an operation, enter the next number the same way, and press =.
                    </p>
                    <p>
                        Answers are reduced to lowest terms and shown as a mixed number, so 1/2 + 3/4 comes out as
                        1-1/4 rather than 5/4. The decimal equivalent sits underneath, and it updates as you type so
                        you can see where a sum is heading before you finish it.
                    </p>
                    <p>
                        The first pad also takes decimals, which is handy for mixing the two: 2.5 + 1/4 gives 2-3/4.
                        Keep going after an answer to chain calculations, and open History to look back over the last
                        twenty.
                    </p>
                    <h3>Using a keyboard</h3>
                    <p>
                        Click the calculator, then type. Digits go to the highlighted pad and Space moves to the next
                        one, so 2, Space, 3, Space, 4 enters 2-3/4. Use + - * / for the operations, Enter or = for
                        the answer, Backspace to delete a digit and Esc to clear.
                    </p>
                </ToolGuide>
                <CommissionCta />

            </main>

            <Footer />
        </>
    );
}
