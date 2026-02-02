import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const siteConfig = {
  name: "Francesco Mollica",
  title: "Francesco Mollica | Software Engineer & Digital Architect",
  description: "Portfolio of Francesco Mollica, a Full Stack Engineer and Architect specialized in high-performance web applications, Three.js, and complex digital and automation solutions.",
  url: "https://francismollica.it", // Replace with your actual domain
  ogImage: "/og-image.png", // Make sure to create this image
  links: {
    github: "https://github.com/francimolli",
    instagram: "https://instagram.com/francimolli",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Francesco Mollica",
    "Full Stack Engineer",
    "Software Engineer Italy",
    "Next.js Developer",
    "Three.js Portfolio",
    "Web Performance",
    "Architect Engineer",
    "Digital Explorer",
  ],
  authors: [
    {
      name: "Francesco Mollica",
      url: "https://francismollica.it",
    },
  ],
  creator: "Francesco Mollica",
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@francimolli",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "/",
    languages: {
      "it-IT": "/it",
      "en-US": "/en",
    },
  },
  verification: {
    google: "P-YrKAWw5Gds5KaZNi_nJ1KeuzPX08LUzC5gyfGbR0Q", // Add your code here
  },
};

import { Analytics } from "@vercel/analytics/react";
import { LanguageProvider } from "@/lib/language-context";
import JsonLd from "@/components/JsonLd";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${lato.variable} antialiased font-sans`}
      >
        <JsonLd />
        <LanguageProvider>
          {children}
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
