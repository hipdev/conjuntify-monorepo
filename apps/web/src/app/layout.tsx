import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import { cn } from '@/lib/utils';

import './globals.css';

export const metadata: Metadata = {
  title: 'Conjuntify',
  description: 'Conjuntify'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={cn(GeistMono.variable, GeistSans.variable)}>
        {children}
      </body>
    </html>
  );
}
