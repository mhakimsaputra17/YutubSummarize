import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Youtube, MessageSquare, FileText, Sparkles } from 'lucide-react';

export default function Features() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8 gradient-text">Features</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="w-6 h-6 text-purple-400" />
              YouTube Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Seamlessly integrate with YouTube videos. Just paste the URL, and we'll handle the rest.
            </p>
          </CardContent>
        </Card>
        <Card className="space-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-400" />
              Transcript Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Automatically generate accurate transcripts for any YouTube video, making content more accessible.
            </p>
          </CardContent>
        </Card>
        <Card className="space-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              AI-Powered Summaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Get concise, intelligent summaries of video content, saving you time and enhancing understanding.
            </p>
          </CardContent>
        </Card>
        <Card className="space-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-400" />
              Interactive Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Engage with our AI chatbot to ask questions and gain deeper insights about the video content.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

