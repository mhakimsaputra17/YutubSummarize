import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

interface ThemeToggleProps {
  isDarkMode: boolean
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ThemeToggle({ isDarkMode, setIsDarkMode }: ThemeToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="rounded-full text-white hover:text-purple-400 transition-colors duration-300"
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDarkMode ? 0 : 180 }}
          transition={{ duration: 0.5 }}
        >
          {isDarkMode ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </motion.div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>
  )
}

