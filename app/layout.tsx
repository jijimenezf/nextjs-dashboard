import type { Metadata } from 'next'
//import { Inter } from 'next/font/google'
import './globals.css'
import { inter } from './ui/fonts'

//const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dashboard Next App',
  description: 'Dashboard Nextjs v14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
