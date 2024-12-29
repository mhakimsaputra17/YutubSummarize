'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NavbarLayout({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    const initialDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);
    setIsDarkMode(initialDarkMode);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className="min-h-screen space-gradient overflow-hidden relative flex flex-col">
      <nav className="sticky top-0 w-full z-50 glassmorphism">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center gap-2">
                <Youtube className="w-6 h-6 text-purple-400" />
                <span className="gradient-text text-xl font-bold hidden sm:inline">
                  ChatwithYoutube
                </span>
              </Link>

              <div className="hidden md:flex items-center space-x-1">
                <Link href="/" className="nav-link">
                  Home
                </Link>
                <Link href="/features" className="nav-link">
                  Features
                </Link>
                <Link href="/about" className="nav-link">
                  About
                </Link>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4"
              >
                <div className="flex flex-col space-y-2">
                  <Link href="/" className="nav-link">
                    Home
                  </Link>
                  <Link href="/features" className="nav-link">
                    Features
                  </Link>
                  <Link href="/about" className="nav-link">
                    About
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}

