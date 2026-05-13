import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'The House Sitter Directory — Your Home, Lovingly Cared For',
  description:
    'Connect with verified, trusted house sitters who treat your home like their own.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
