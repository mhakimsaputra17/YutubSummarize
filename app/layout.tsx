import './globals.css'
import { Inter } from 'next/font/google'
import { Heart } from 'lucide-react'
import NavbarLayout from '@/components/NavbarLayout'

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
      <body className={`${inter.className} bg-background text-foreground dark flex flex-col min-h-screen`}>
        <NavbarLayout>
          {children}
        </NavbarLayout>
        <footer className="w-full py-4 text-center bg-black/60 backdrop-blur-sm border-t border-purple-500/30">
          <p className="text-sm text-white/80 flex items-center justify-center">
            Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> by mhakimsaputra17
          </p>
        </footer>
      </body>
    </html>
  )
}

