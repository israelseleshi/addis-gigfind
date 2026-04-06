import { JetBrains_Mono, Public_Sans } from "next/font/google";
import ClientLayoutWrapper from '@/components/client-layout-wrapper';
import { getAppUrl } from '@/lib/app-url';
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Addis GigFind - Local Skills Marketplace",
    template: "%s | Addis GigFind",
  },
  description: "Connect with skilled freelancers in Addis Ababa. Post gigs, find work, and grow your business with Ethiopia's trusted local marketplace.",
  keywords: ["freelance", "Addis Ababa", "Ethiopia", "gigs", "services", "local marketplace", "hire freelancers"],
  authors: [{ name: "Addis GigFind" }],
  creator: "Addis GigFind",
  publisher: "Addis GigFind",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(getAppUrl()),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Addis GigFind - Local Skills Marketplace",
    description: "Connect with skilled freelancers in Addis Ababa. Post gigs, find work, and grow your business.",
    siteName: "Addis GigFind",
  },
  twitter: {
    card: "summary_large_image",
    title: "Addis GigFind - Local Skills Marketplace",
    description: "Connect with skilled freelancers in Addis Ababa. Post gigs, find work, and grow your business.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Addis GigFind",
  },
  other: {
    "mobile-web-app-capable": "yes",
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
        className={`${publicSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
