import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Youtube, Clipboard, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useToast } from "@/app/hooks/use-toast"

interface LinkInputProps {
  onSubmit: (url: string) => void
  isLoading: boolean
}

export default function LinkInput({ onSubmit, isLoading }: LinkInputProps) {
  const [url, setUrl] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a YouTube URL",
       // icon: <AlertCircle className="h-5 w-5" />
      })
      return
    }
    onSubmit(url)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err)
      toast({
        variant: "destructive",
        title: "Clipboard Error",
        description: "Failed to paste from clipboard. Please try manually entering the URL.",
        icon: <AlertCircle className="h-5 w-5" />
      })
    }
  }

  return (
    <Card className="space-card overflow-hidden">
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6"
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
              className="space-input pl-10 pr-10 w-full"
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
                layoutId="input-focus"
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
          <Button 
            type="submit"
            className="space-button w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </Card>
  )
}

