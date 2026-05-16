import type { Metadata } from 'next'
import './globals.css'
import { ThemeScript } from '@/components/ui/ThemeToggle'

export const metadata: Metadata = {
  title: 'XAUUSD Trading Journal',
  description: 'Personal Gold trading journal with AI insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <ThemeScript />
      </head>
      <body className="h-full">
        {children}
      </body>
    </html>
  )
}
