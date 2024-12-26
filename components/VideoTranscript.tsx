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

  // Fungsi untuk mendapatkan segmen aktif berdasarkan waktu video
  const getActiveSegment = () => {
    return filteredSegments.find(
      (segment) => currentTime >= segment.startTime && currentTime < segment.endTime
    );
  };

  // Auto-scroll ke segmen aktif
  useEffect(() => {
    if (autoScroll && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // Ubah ke 'center' agar segmen aktif lebih terlihat
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

  const activeSegment = getActiveSegment();

  return (
    <motion.div
      className="space-card rounded-xl overflow-hidden h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-2 p-3 border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-white font-orbitron">Transcript</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Layout className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
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
              className="text-gray-400 hover:text-white"
              onClick={downloadTranscript}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
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
            className="w-full bg-black/50 border-purple-500/30 focus-visible:ring-purple-400 text-white placeholder-gray-400 pl-10 font-space-grotesk"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
      <ScrollArea className="flex-1 h-[calc(100%-80px)] space-scrollbar">
        <div className="divide-y divide-purple-500/10">
          {filteredSegments.length > 0 ? (
            filteredSegments.map((segment, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => onSeek(segment.startTime)}
                  className="w-full text-left px-4 py-3 hover:bg-purple-500/10 transition-colors"
                >
                  <div
                    ref={activeSegment === segment ? activeRef : null}
                    className={`flex items-start gap-3 ${
                      activeSegment === segment ? 'bg-purple-500/10' : ''
                    }`}
                  >
                    <span className="text-sm text-purple-400 font-medium min-w-[80px] pt-0.5 font-orbitron">
                      {segment.timeRange}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-white font-space-grotesk">
                        {segment.text}
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))
          ) : (
            <p className="text-white text-center py-4">No transcript available.</p>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}