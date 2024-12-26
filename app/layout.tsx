import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ChatwithYoutube',
  description: 'Elevate your YouTube viewing experience with AI-powered summaries and chat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground dark`}>{children}</body>
    </html>
  )
}

