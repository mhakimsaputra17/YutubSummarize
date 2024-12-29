import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, useAnimation } from 'framer-motion'
import { MessageSquare, Send, Bot, User, Paperclip } from 'lucide-react'

interface ChatComponentProps {
  videoId: string
}

interface Message {
  role: 'user' | 'ai'
  content: string
  pending?: boolean
}

export default function ChatComponent({ videoId }: ChatComponentProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    })
  }, [controls])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    
    const pendingMessage: Message = { role: 'ai', content: '', pending: true }
    setMessages((prev) => [...prev, pendingMessage])
    
    setInput('')
    setIsTyping(true)

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoId, 
          question: input,
          history
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'ai', content: data.answer }
      ])

    } catch (error) {
      console.error('Error in chat:', error)
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className="space-card rounded-xl overflow-hidden"
    >
      <CardHeader className="border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-black/50">
        <CardTitle className="flex items-center gap-2 text-white">
          <Bot className="w-5 h-5 text-purple-400" />
          Chat with AI
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[50vh] sm:h-[400px] p-4 space-scrollbar bg-black/60 backdrop-blur-xl" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 flex items-start gap-2 ${
                    message.role === 'user'
                      ? 'bg-purple-600/50 text-white ml-4'
                      : 'bg-gray-700/50 text-white mr-4'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 mt-1 text-white flex-shrink-0" />
                  ) : (
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 mt-1 text-purple-400 flex-shrink-0" />
                  )}
                  {message.pending ? (
                    <span className="typing-animation font-space-grotesk text-sm sm:text-base">AI is thinking...</span>
                  ) : (
                    <p className="font-space-grotesk whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-gray-700/50 text-white rounded-2xl px-4 py-2 mr-4 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <span className="typing-animation font-space-grotesk">Typing</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t border-purple-500/30 p-4 bg-black/60 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="relative flex-grow">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Ask anything about the video..."
                className="w-full bg-black/50 border-purple-500/30 focus-visible:ring-purple-400 text-white placeholder-gray-400 pr-10 font-space-grotesk resize-none overflow-hidden min-h-[40px]"
                style={{ height: '40px' }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 bottom-2 text-gray-400 hover:text-white"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              type="submit" 
              size="icon"
              className="bg-purple-600 text-white rounded-full h-10 w-10 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </motion.div>
  )
}

