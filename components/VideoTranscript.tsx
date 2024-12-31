import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Clock, Download, Layout, Settings, Search, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface TranscriptSegment {
  timeRange: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface VideoTranscriptProps {
  transcript: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function VideoTranscript({ transcript, currentTime, onSeek }: VideoTranscriptProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const activeSegmentIndex = useRef(-1);
  const activeSegmentRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Filter transcript segments based on search query
  const filteredSegments = transcript.filter((segment) =>
    segment.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the active segment based on currentTime
  const getActiveSegment = () => {
    const active = filteredSegments.findIndex(
      (segment) => currentTime >= segment.startTime && currentTime < segment.endTime
    );
    activeSegmentIndex.current = active;
    return active;
  };

  // Update active segment when currentTime or filteredSegments changes
  useEffect(() => {
    getActiveSegment();
  }, [currentTime, filteredSegments]);

  // Auto-scroll to the active segment if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && activeSegmentRef.current && scrollAreaRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentTime, autoScroll]);

  // Function to download the transcript as a text file
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
      className="space-card h-[600px] overflow-hidden rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex-none p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-black/50">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold text-white font-orbitron flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-400" />
              Transcript
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Layout className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Clock className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 px-2 text-sm text-gray-400">
                <span className="hidden sm:inline">Auto-scroll</span>
                <Switch
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                onClick={downloadTranscript}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* Search Input */}
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

        {/* Transcript Content */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4">
              {filteredSegments.length > 0 ? (
                <div className="space-y-2">
                  {filteredSegments.map((segment, index) => (
                    <motion.div
                      key={index}
                      ref={index === activeSegmentIndex.current ? activeSegmentRef : null}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        index === activeSegmentIndex.current ? 'bg-purple-500/20 shadow-md' : 'hover:bg-purple-500/10'
                      }`}
                      onClick={() => onSeek(segment.startTime)}
                    >
                      <p className="text-sm text-white/90 mb-1">{segment.text}</p>
                      <span className="text-xs text-purple-400 font-mono flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
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
