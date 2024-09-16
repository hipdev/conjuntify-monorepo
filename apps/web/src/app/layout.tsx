import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'

import { cn } from '@/lib/utils'

import './globals.css'
import { ConvexClientProvider } from '@/components/providers/convex-client-provider'

export const metadata: Metadata = {
  title: 'Conjuntify',
  description: 'Conjuntify'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang='en'>
        <body className={cn(GeistMono.variable, GeistSans.variable)}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <Toaster />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
