import type { Metadata } from 'next'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'النشرة الأسبوعية',
    template: '%s | العربي',
  },
  description: 'نشرة إخبارية عربية متميزة — محتوى أصيل ومنتقى بعناية',
  keywords: ['نشرة', 'عربي', 'أخبار', 'مقالات'],
  openGraph: {
    locale: 'ar_SA',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexSansArabic.variable}>
      <body className="font-sans antialiased bg-white text-[#1a1a2e]">
        {children}
      </body>
    </html>
  )
}
