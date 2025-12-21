"use client";

import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { usePathname } from 'next/navigation';
import { Header } from "@/components/header";
import { Toaster } from 'sonner';
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
  const hideHeaderPaths = ['/register/freelancer', '/register/client', '/client', '/freelancer'];
  const showHeader = !hideHeaderPaths.some(path => pathname.startsWith(path));

  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} antialiased`}
      >
        {showHeader && <Header />}
        {children}
        <Toaster position="top-right" toastOptions={{
          classNames: {
            success: 'bg-green-500 text-white',
          },
        }} />
      </body>
    </html>
  );
}
