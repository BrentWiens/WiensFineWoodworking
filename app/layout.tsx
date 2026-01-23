import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
  title: "Wiens Fine Woodworking | Custom Furniture & Handcrafted Wood Projects",
  description: "Handcrafted furniture and custom woodworking projects built with precision and care. Quality custom furniture, cutting boards, and unique wood pieces.",
  keywords: ["woodworking", "custom furniture", "handcrafted", "wood projects", "cutting boards", "furniture"],
  authors: [{ name: "Wiens Fine Woodworking" }],
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Wiens Fine Woodworking",
    description: "Handcrafted furniture and custom woodworking projects",
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
    description: "Handcrafted furniture and custom woodworking projects",
    images: ["/images/handplanes.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Wiens Fine Woodworking',
    description: 'Handcrafted furniture and custom woodworking projects',
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
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}