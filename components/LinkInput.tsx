import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Youtube, Clipboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface LinkInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function LinkInput({ onSubmit, isLoading }: LinkInputProps) {
  const [url, setUrl] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [pasteError, setPasteError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      alert('Please enter a valid YouTube URL');
      return;
    }
    onSubmit(url);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setPasteError(false);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      setPasteError(true);
      // Fallback untuk browser yang tidak mendukung clipboard API
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      document.execCommand('paste');
      const pastedText = input.value;
      document.body.removeChild(input);
      if (pastedText) {
        setUrl(pastedText);
      }
    }
  };

  return (
    <Card className="space-card overflow-hidden">
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div 
            className="relative flex-grow"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter YouTube video URL"
              className="space-input pl-10 pr-10"
            />
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handlePaste}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Clipboard className="w-4 h-4" />
            </Button>
            {isHovered && (
              <motion.div
                className="absolute inset-0 border-2 border-purple-400 rounded-md pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
          <Button 
            type="submit"
            className="space-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <span className="animate-spin mr-2">🌀</span>
                Processing...
              </div>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
        {pasteError && (
          <p className="text-red-500 text-sm mt-2">
            Clipboard access denied. Please paste the URL manually.
          </p>
        )}
      </motion.form>
    </Card>
  );
}