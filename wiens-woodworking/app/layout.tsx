import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wiens Fine Woodworking | Custom Furniture & Handcrafted Wood Projects",
  description: "Handcrafted furniture and custom woodworking projects built with precision and care. Quality custom furniture, cutting boards, and unique wood pieces.",
  keywords: ["woodworking", "custom furniture", "handcrafted", "wood projects", "cutting boards", "furniture"],
  authors: [{ name: "Wiens Fine Woodworking" }],
  openGraph: {
    title: "Wiens Fine Woodworking",
    description: "Handcrafted furniture and custom woodworking projects",
    type: "website",
    url: "https://wfinew.com",
    images: [
      {
        url: "/images/handplanes.jpg",
        width: 1200,
        height: 630,
        alt: "Wiens Fine Woodworking",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}