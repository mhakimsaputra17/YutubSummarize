import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8 gradient-text">About ChatwithYoutube</h1>
      <Card className="space-card">
        <CardContent className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-4">
            ChatwithYoutube is an innovative platform designed to enhance your YouTube viewing experience. 
            Our mission is to make video content more accessible, understandable, and interactive.
          </p>
          <p className="text-gray-300 mb-4">
            With the power of AI, we provide features like automatic transcript generation, 
            intelligent video summaries, and an interactive chatbot that can answer questions about the video content.
          </p>
          <p className="text-gray-300 mb-4">
            Whether you're a student looking to quickly grasp educational content, 
            a professional needing to extract key points from lengthy presentations, 
            or just someone who wants to get more out of their YouTube watching, ChatwithYoutube is here to help.
          </p>
          <p className="text-gray-300">
            We're constantly working to improve our services and add new features. 
            If you have any suggestions or feedback, we'd love to hear from you!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

