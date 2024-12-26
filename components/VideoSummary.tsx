import { useState, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, useAnimation } from 'framer-motion';
import { Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoSummaryProps {
  summary: string; // Prop untuk menerima summary langsung
}

export default function VideoSummary({ summary }: VideoSummaryProps) {
  const [displayedSummary, setDisplayedSummary] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const controls = useAnimation();

  // Animasi typing effect
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < summary.length) {
        setDisplayedSummary(summary.slice(0, i + 1)); // Perbaiki cara update state
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 20);

    return () => clearInterval(typingInterval); // Bersihkan interval saat komponen unmount
  }, [summary]);

  // Animasi komponen
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    });
  }, [controls]);

  // Fungsi untuk menyalin summary
  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className="space-card rounded-xl overflow-hidden"
    >
      <CardHeader className="border-b border-purple-500/30 bg-black/50">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Summary
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isCopied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-black/60 backdrop-blur-xl">
        <p className="text-white leading-relaxed font-space-grotesk">{displayedSummary}</p>
      </CardContent>
    </motion.div>
  );
}