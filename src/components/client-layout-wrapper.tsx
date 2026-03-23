"use client";

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/header').then(mod => mod.Header), { ssr: false });
import { Toaster } from 'sonner';
import PageTransition from '@/components/page-transition';

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideHeaderPaths = ['/client', '/freelancer', '/admin'];
  const showHeader = !hideHeaderPaths.some(path => pathname.startsWith(path));

  return (
    <>
      {showHeader && <Header />}
      <PageTransition>{children}</PageTransition>
      <Toaster position="top-center" toastOptions={{
        classNames: {
          success: 'bg-amber-500 text-white border-amber-600',
        },
      }} />
    </>
  );
}
