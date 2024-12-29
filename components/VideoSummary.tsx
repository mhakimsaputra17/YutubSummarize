import { useState, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, useAnimation } from 'framer-motion';
import { Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoSummaryProps {
  summary: string;
}

export default function VideoSummary({ summary }: VideoSummaryProps) {
  const [isCopied, setIsCopied] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    });
  }, [controls]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatSummary = (text: string) => {
    try {
      const processText = (text: string) => {
        text = text.replace(/\*\*/g, '');
        const emojiMap: { [key: string]: string } = {
          ':bulb:': '💡',
          ':dart:': '🎯',
          ':pushpin:': '📌',
          ':point_right:': '👉',
          ':sparkles:': '✨',
          '-': '•'
        };
        Object.entries(emojiMap).forEach(([text, emoji]) => {
          const regex = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          text = text.replace(regex, emoji);
        });
        return text.trim();
      };

      const paragraphs = text.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => processText(line));

      return paragraphs
        .map((paragraph) => {
          if (/^\d+\.\s/.test(paragraph)) {
            const number = paragraph.match(/^\d+/)?.[0] || '';
            const content = paragraph.replace(/^\d+\.\s/, '');
            return `<div class="mb-4">
              <h3 class="text-lg font-semibold text-gradient-purple mb-2 flex items-center gap-2">
                <span class="bg-purple-500/20 rounded-full px-3 py-1">${number}</span>
                ${content}
              </h3>
            </div>`;
          }
          if (/^(💡|🎯|📌|👉|✨)/.test(paragraph)) {
            const [emoji, ...content] = paragraph.split(' ');
            return `<div class="mb-3 bg-purple-500/10 rounded-lg p-3">
              <h4 class="text-md font-medium text-white flex items-center gap-2">
                <span class="text-xl">${emoji}</span>
                ${content.join(' ')}
              </h4>
            </div>`;
          }
          if (paragraph.startsWith('•')) {
            return `<div class="flex items-start gap-2 mb-2 ml-4">
              <span class="text-purple-400 mt-1">•</span>
              <p class="text-gray-200">${paragraph.slice(1).trim()}</p>
            </div>`;
          }
          return `<p class="text-gray-200 mb-4 leading-relaxed">${paragraph}</p>`;
        })
        .join('');
    } catch (err) {
      console.error('Error formatting summary:', err);
      return `<p class="text-red-400">Error formatting summary</p>`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className="space-card rounded-xl overflow-hidden shadow-lg shadow-purple-500/10"
    >
      <CardHeader className="border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-black/50">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              AI Summary
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="text-gray-400 hover:text-purple-400 transition-colors"
          >
            {isCopied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-b from-black/60 to-purple-900/20 backdrop-blur-xl">
        <div
          className="text-white leading-relaxed font-space-grotesk space-y-2"
          dangerouslySetInnerHTML={{ __html: formatSummary(summary) }}
        />
      </CardContent>
    </motion.div>
  );
}

