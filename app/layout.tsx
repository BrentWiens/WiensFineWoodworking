import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ServiceWorkerRegistration } from "@/components";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// preload:false because the mono face is only used by the calculator pages, but
// this layout is shared by every route — preloading it made the homepage and
// gallery fetch a font they never render a single character with. Without the
// preload hint the browser fetches it only when something actually applies it.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wfinew.com"),
  title: "Wiens Fine Woodworking | Custom Tables & Desks Handcrafted in Kitchener",
  description: "Custom dining tables, coffee tables, end tables, and desks handcrafted in Kitchener, Ontario. Built with precision, quality materials, and traditional craftsmanship.",
  keywords: ["custom tables", "custom desks", "dining table", "coffee table", "end table", "home office desk", "woodworking", "handcrafted furniture", "Kitchener", "finish carpentry"],
  authors: [{ name: "Wiens Fine Woodworking" }],
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  // og/twitter images come from the `opengraph-image.jpg` file convention in each
  // route segment — do not hand-write `images` here or it overrides those files.
  openGraph: {
    title: "Wiens Fine Woodworking",
    description: "Custom tables and desks handcrafted in Kitchener, Ontario",
    type: "website",
    url: "https://wfinew.com",
    siteName: "Wiens Fine Woodworking",
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wiens Fine Woodworking",
    description: "Custom tables and desks handcrafted in Kitchener, Ontario",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Deliberately omitted: telephone, geo coordinates and priceRange. Google will
  // use them if present, but only add them once they are real — inventing them is
  // worse than leaving them out.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://wfinew.com/#business',
    name: 'Wiens Fine Woodworking',
    description:
      'Custom dining tables, coffee tables, end tables, desks and finish carpentry, handcrafted in Kitchener, Ontario.',
    url: 'https://wfinew.com',
    image: 'https://wfinew.com/coffee-table-walnut-angled.jpg',
    logo: 'https://wfinew.com/favicon.ico',
    founder: {
      '@type': 'Person',
      name: 'Brent Wiens',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kitchener',
      addressRegion: 'ON',
      addressCountry: 'CA',
    },
    areaServed: [
      { '@type': 'City', name: 'Kitchener' },
      { '@type': 'City', name: 'Waterloo' },
      { '@type': 'City', name: 'Cambridge' },
      { '@type': 'City', name: 'Guelph' },
      { '@type': 'AdministrativeArea', name: 'Southwestern Ontario' },
    ],
    knowsAbout: [
      'Custom furniture making',
      'Dining tables',
      'Desks',
      'Finish carpentry',
      'Cabinetry',
      'Hardwood joinery',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Custom woodworking',
      itemListElement: [
        'Custom dining tables',
        'Coffee tables and end tables',
        'Desks and home office furniture',
        'Built-in cabinetry and finish carpentry',
      ].map(name => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name },
      })),
    },
    sameAs: [
      'https://www.facebook.com/people/Wiens-Fine-Woodworking/61559807342865',
      'https://www.instagram.com/wiensfinewoodworking/',
      'https://www.linkedin.com/in/brentwiens/',
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-stone-800 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}