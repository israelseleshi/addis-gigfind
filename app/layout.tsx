"use client";

import type { Metadata } from "next";
import { JetBrains_Mono, Public_Sans } from "next/font/google";
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/header').then(mod => mod.Header), { ssr: false });
import { Toaster } from 'sonner';
import PageTransition from '@/components/page-transition';
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-sans",
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
  const hideHeaderPaths = ['/client', '/freelancer'];
  const showHeader = !hideHeaderPaths.some(path => pathname.startsWith(path));

  return (
    <html lang="en">
      <body
        className={`${publicSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {showHeader && <Header />}
        <PageTransition>{children}</PageTransition>
        <Toaster position="top-right" toastOptions={{
          classNames: {
            success: 'bg-green-500 text-white',
          },
        }} />
      </body>
    </html>
  );
}
