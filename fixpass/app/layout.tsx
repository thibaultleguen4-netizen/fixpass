import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FixPass — Le carnet de santé de vos objets',
  description: 'Scannez vos factures, retrouvez vos garanties, estimez vos objets.',
  manifest: '/manifest.json',
  themeColor: '#1D9E75',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FixPass',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1D9E75" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FixPass" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
