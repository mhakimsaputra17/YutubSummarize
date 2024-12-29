'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import LinkInput from '@/components/LinkInput';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import VideoSummary from '@/components/VideoSummary';
import VideoTranscript from '@/components/VideoTranscript';
import ChatComponent from '@/components/ChatComponent';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster"

// Dynamically import StarField to avoid SSR
const StarField = dynamic(() => import('@/components/StarField'), { ssr: false });

export default function Home() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVideoSubmit = async (url: string) => {
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      setIsLoading(true);
      setError(null);
      try {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to fetch summary');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: id }),
      });
      if (!response.ok) throw new Error('Failed to fetch transcript');
      const data = await response.json();
      const processedSegments = data.segments?.map((segment: any) => ({
        ...segment,
        start: Number(segment.start),
        end: Number(segment.end),
      })) || [];
      setTranscript(processedSegments);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      setTranscript([]);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <>
      <StarField />
      <div className="nebula-glow left-1/4 top-1/4" />
      <div className="nebula-glow right-1/4 bottom-1/4" />

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
            <motion.div className="flex items-center gap-1 text-white/80">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI-Powered Analysis
            </motion.div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-purple-600/50" />
            <motion.div className="flex items-center gap-1 text-white/80">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Smart Summaries
            </motion.div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-purple-600/50" />
            <motion.div className="flex items-center gap-1 text-white/80">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Interactive Chat
            </motion.div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto mb-12">
          <LinkInput onSubmit={handleVideoSubmit} isLoading={isLoading} />
          {error && (
            <p className="text-red-500 text-sm mt-4 text-center" suppressHydrationWarning>
              {error}
            </p>
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

              {transcript.length > 0 && (
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
              {transcript.length > 0 && (
                <motion.div layout>
                  <ChatComponent videoId={videoId} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
      <Toaster />
    </>
  );
}

