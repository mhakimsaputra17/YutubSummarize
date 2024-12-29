import { motion } from 'framer-motion';
import YouTube from 'react-youtube';
import { useRef, useEffect } from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  onTimeUpdate: (time: number) => void;
}

export default function YouTubeEmbed({ videoId, onTimeUpdate }: YouTubeEmbedProps) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function untuk interval
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    event.target.playVideo();
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      // Clear existing interval if any
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Set new interval for time updates
      intervalRef.current = setInterval(() => {
        const currentTime = playerRef.current.getCurrentTime();
        onTimeUpdate(currentTime);
      }, 100); // Update more frequently (every 100ms) for smoother scrolling
    } else {
      // Clear interval when video is paused/stopped
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <YouTube
        videoId={videoId}
        opts={{
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
          },
        }}
        className="w-full h-full"
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
      />
    </motion.div>
  );
}

