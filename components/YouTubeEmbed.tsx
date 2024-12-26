import { motion } from 'framer-motion';
import YouTube from 'react-youtube';
import { useRef, useEffect } from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  onTimeUpdate: (time: number) => void; // Callback untuk mengirim waktu pemutaran video
}

export default function YouTubeEmbed({ videoId, onTimeUpdate }: YouTubeEmbedProps) {
  const playerRef = useRef<any>(null);

  // Handler untuk event saat video diputar
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    event.target.playVideo();
  };

  // Handler untuk event saat waktu video berubah
  const onPlayerStateChange = (event: any) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      const interval = setInterval(() => {
        const currentTime = playerRef.current.getCurrentTime();
        onTimeUpdate(currentTime); // Kirim waktu pemutaran ke parent component
      }, 1000);

      // Clear interval saat komponen unmount atau video berhenti
      return () => clearInterval(interval);
    }
  };

  return (
    <motion.div
      className="rounded-xl overflow-hidden"
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
        className="aspect-video w-full"
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
      />
    </motion.div>
  );
}