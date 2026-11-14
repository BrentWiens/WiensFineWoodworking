/**
 * The public calculators, in the order they appear on /tools.
 *
 * One list, so the index page, each tool's "More tools" links, the structured data
 * and the sitemap can't drift apart. The private business tools are deliberately
 * not here — they stay out of the sitemap and are listed on /tools by hand.
 */
export interface Tool {
  slug: string;
  href: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageObjectPosition?: 'center' | 'top';
}

export const SITE_URL = 'https://wfinew.com';

export const TOOLS: Tool[] = [
  {
    slug: 'fractional-calculator',
    href: '/tools/fractional-calculator',
    title: 'Fractional Calculator',
    description: 'A convenient fractional calculator. Add, subtract, multiply, and divide fractions with ease.',
    imageSrc: '/images/fractional-calculator/fractional-calculator-preview.png',
    imageAlt: 'Fractional calculator preview',
  },
  {
    slug: 'board-feet-calculator',
    href: '/tools/board-feet-calculator',
    title: 'Board Feet Calculator',
    description: 'Calculate lumber volume in board feet from thickness, width, and length.',
    imageSrc: '/images/board-feet-calculator/board-feet-calculator-preview.png',
    imageAlt: 'Board feet calculator preview',
    imageObjectPosition: 'top',
  },
  {
    slug: 'cut-list-optimizer',
    href: '/tools/cut-list-optimizer',
    title: 'Cut List Optimizer',
    description: 'Optimize plywood cuts to minimize waste. Supports grain direction for consistent appearance.',
    imageSrc: '/images/cut-list-optimizer/cut-list-optimizer-preview.png',
    imageAlt: 'Cut list optimizer preview',
    imageObjectPosition: 'top',
  },
  {
    slug: 'trig-calculator',
    href: '/tools/trig-calculator',
    title: 'Trigonometry Calculator',
    description: 'Solve any right triangle. Enter two known sides or angles to calculate the rest. Supports fractional input.',
    imageSrc: '/images/trigonometry-calculator/trig-calculator.png',
    imageAlt: 'Trigonometry calculator preview',
  },
  {
    slug: 'dovetail-calculator',
    href: '/tools/dovetail-calculator',
    title: 'Dovetail Joint Calculator',
    description: 'Visualize and plan your dovetail joints with custom dimensions, pin angles, and spacing.',
    imageSrc: '/images/dovetail-calculator/dovetail-calculator-preview.png',
    imageAlt: 'Dovetail joint preview',
    imageObjectPosition: 'top',
  },
];

export type ToolSlug = (typeof TOOLS)[number]['slug'];

export function getTool(slug: string): Tool {
  const tool = TOOLS.find(t => t.slug === slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}
