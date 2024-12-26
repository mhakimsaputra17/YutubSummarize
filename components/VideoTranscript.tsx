import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Clock, Download, Layout, Settings, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface TranscriptSegment {
  timeRange: string; // Format: "00:00 - 00:30"
  text: string;
  startTime: number; // Waktu mulai dalam detik
  endTime: number; // Waktu selesai dalam detik
}

interface VideoTranscriptProps {
  transcript: TranscriptSegment[];
  currentTime: number; // Waktu video yang sedang diputar
  onSeek: (time: number) => void; // Fungsi untuk mengubah waktu video
}

export default function VideoTranscript({ transcript, currentTime, onSeek }: VideoTranscriptProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const activeRef = useRef<HTMLDivElement | null>(null);

  // Filter segmen berdasarkan query pencarian
  const filteredSegments = transcript.filter((segment) =>
    segment.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fungsi untuk mendapatkan segmen aktif
  const getActiveSegment = () => {
    return filteredSegments.find(
      (segment) => currentTime >= segment.startTime && currentTime < segment.endTime
    );
  };

  // Effect untuk auto-scroll
  useEffect(() => {
    if (autoScroll && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentTime, autoScroll]);

  // Fungsi untuk mendownload transkrip
  const downloadTranscript = () => {
    const header = `Transcript for Video\n\n`;
    const content = transcript
      .map((segment) => `${segment.timeRange}\n${segment.text}`)
      .join('\n\n');

    const finalContent = header + content;

    const blob = new Blob([finalContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="space-card h-[600px] overflow-hidden" // Fixed height
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex-none p-4 border-b border-purple-500/30 bg-black/50">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold text-white font-orbitron">Transcript</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-400">
                <Layout className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <Clock className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 px-2 text-sm text-gray-400">
                Auto-scroll
                <Switch
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400"
                onClick={downloadTranscript}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border-purple-500/30 focus-visible:ring-purple-400 text-white placeholder-gray-400 pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Transcript Content with ScrollArea */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {filteredSegments.length > 0 ? (
                <div className="space-y-2">
                  {filteredSegments.map((segment, index) => (
                    <motion.div
                      key={index}
                      ref={
                        currentTime >= segment.startTime && currentTime < segment.endTime
                          ? (ref) => {
                              activeRef.current = ref;
                            }
                          : null
                      }
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        currentTime >= segment.startTime && currentTime <= segment.endTime
                          ? 'bg-purple-500/20'
                          : 'hover:bg-purple-500/10'
                      }`}
                      onClick={() => onSeek(segment.startTime)}
                    >
                      <p className="text-sm text-white/90 mb-1">{segment.text}</p>
                      <span className="text-xs text-purple-400 font-mono">
                        {segment.timeRange}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-white/60 text-center">No transcript available</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
}