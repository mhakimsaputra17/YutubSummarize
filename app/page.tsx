'use client';

import { useState, useEffect } from 'react';
import LinkInput from '@/components/LinkInput';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import VideoSummary from '@/components/VideoSummary';
import VideoTranscript from '@/components/VideoTranscript';
import ChatComponent from '@/components/ChatComponent';
import ThemeToggle from '@/components/ThemeToggle';
import StarField from '@/components/StarField';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, Youtube, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Waktu video yang sedang diputar
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleVideoSubmit = async (url: string) => {
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      setIsLoading(true);
      setError(null);
      try {
        // Clear previous data when loading new video
        setSummary(null);
        setTranscript([]);
        
        await fetchTranscript(id);
        await fetchSummary(id);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Invalid YouTube URL. Please check the URL and try again.');
    }
  };

  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const fetchSummary = async (id: string) => {
  try {
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id, // Kirim videoId saja
      }),
      next: { revalidate: 3600 }, // Enable ISR caching
    });

    if (!response.ok) {
      throw new Error('Failed to fetch summary');
    }

    const data = await response.json();
    setSummary(data.summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    setSummary('Failed to fetch summary');
  }
};

  const fetchTranscript = async (id: string) => {
  try {
    const response = await fetch('/api/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: id, // Kirim videoId dalam body
      }),
      next: { revalidate: 3600 }, // Enable ISR caching
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transcript');
    }

    const data = await response.json();
    console.log('Transcript Data:', data); // Verifikasi data transkrip
    // Ensure all timestamps are numbers
    const processedSegments = data.segments?.map((segment: any) => ({
      ...segment,
      start: Number(segment.start),
      end: Number(segment.end)
    })) || [];
    
    setTranscript(processedSegments);
  } catch (error) {
    console.error('Error fetching transcript:', error);
    setTranscript([]);
  }
};

  // Fungsi untuk mengubah waktu video
  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <main className="min-h-screen space-gradient overflow-hidden relative">
      <StarField />
      <div className="nebula-glow left-1/4 top-1/4" />
      <div className="nebula-glow right-1/4 bottom-1/4" />
      
      <nav className="sticky top-0 w-full z-50 glassmorphism">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <Youtube className="w-6 h-6 text-purple-400" />
                <span className="gradient-text text-xl font-bold hidden sm:inline">
                  ChatwithYoutube
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-1">
                <motion.a 
                  href="#features" 
                  className="nav-link"
                >
                  Features
                </motion.a>
                <motion.a 
                  href="#how-it-works" 
                  className="nav-link"
                >
                  How it Works
                </motion.a>
                <motion.a 
                  href="#about" 
                  className="nav-link"
                >
                  About
                </motion.a>
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
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
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
                  <a href="#features" className="nav-link">Features</a>
                  <a href="#how-it-works" className="nav-link">How it Works</a>
                  <a href="#about" className="nav-link">About</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10 sm:space-y-16 relative">
        <motion.div 
          className="max-w-3xl mx-auto text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight gradient-text">
              YouTube Video Summarizer
            </h1>
            <p className="text-lg text-white/90">
              Get YouTube transcript and use AI to summarize YouTube videos in one click
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <motion.div 
              className="flex items-center gap-1 text-white/80"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI-Powered Analysis
            </motion.div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-purple-600/50" />
            <motion.div 
              className="flex items-center gap-1 text-white/80"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              Smart Summaries
            </motion.div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-purple-600/50" />
            <motion.div 
              className="flex items-center gap-1 text-white/80"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              Interactive Chat
            </motion.div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto mb-12">
          <LinkInput onSubmit={handleVideoSubmit} isLoading={isLoading} />
          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}
        </div>

        {videoId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8 lg:gap-10">
              <motion.div layout className="h-full">
                <Card className="space-card">
                  <div className="relative w-full pt-[56.25%]">
                    <div className="absolute inset-0">
                      <YouTubeEmbed videoId={videoId} onTimeUpdate={setCurrentTime} />
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              {transcript && (
                <motion.div layout className="h-full">
                  <VideoTranscript
                    transcript={transcript}
                    currentTime={currentTime}
                    onSeek={handleSeek}
                  />
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              {summary && (
                <motion.div layout>
                  <VideoSummary summary={summary} />
                </motion.div>
              )}
              {/* Show chat component only when transcript is available */}
              {transcript.length > 0 && (
                <motion.div layout>
                  <ChatComponent videoId={videoId} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}