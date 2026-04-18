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

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  openGraph: {
    title: "Wiens Fine Woodworking",
    description: "Custom tables and desks handcrafted in Kitchener, Ontario",
    type: "website",
    url: "https://wfinew.com",
    siteName: "Wiens Fine Woodworking",
    images: [
      {
        url: "/images/handplanes.jpg",
        width: 1200,
        height: 630,
        alt: "Wiens Fine Woodworking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wiens Fine Woodworking",
    description: "Custom tables and desks handcrafted in Kitchener, Ontario",
    images: ["/images/handplanes.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Wiens Fine Woodworking',
    description: 'Custom tables and desks handcrafted in Kitchener, Ontario',
    url: 'https://wfinew.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kitchener',
      addressRegion: 'ON',
      addressCountry: 'CA',
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