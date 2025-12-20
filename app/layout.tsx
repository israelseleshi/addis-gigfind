"use client";

import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { usePathname } from 'next/navigation';
import { Header } from "@/components/header";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Addis GigFind: A Local Skills Marketplace",
//   description: "A local skills marketplace connecting clients with freelancers in Addis Ababa",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideHeaderPaths = ['/freelancer', '/client'];
  const showHeader = !hideHeaderPaths.some(path => pathname.startsWith(path));

  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} antialiased`}
      >
        {showHeader && <Header />}
        {children}
      </body>
    </html>
  );
}
