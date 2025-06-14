import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, MessageSquare, Hash, Ticket } from 'lucide-react';
import YouTubeSummarizer from '@/components/YouTubeSummarizer';
import SocialMediaGenerator from '@/components/SocialMediaGenerator';
import CommentGenerator from '@/components/CommentGenerator';
import JiraTicketCreator from '@/components/JiraTicketCreator';

const Index = () => {
  const [activeTools, setActiveTools] = useState<string | null>(null);

  const tools = [
    {
      id: 'youtube',
      title: 'YouTube Video Summarizer',
      description: 'Extract and summarize YouTube video content with AI-powered insights',
      icon: Youtube,
      color: 'from-red-500 to-pink-500',
    },
    {
      id: 'social',
      title: 'Social Media Post Generator',
      description: 'Create engaging posts for LinkedIn, X, YouTube, and more',
      icon: Hash,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'comments',
      title: 'Smart Comment Generator',
      description: 'Generate thoughtful comments for social media interactions',
      icon: MessageSquare,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      id: 'jira',
      title: 'AI Jira Ticket Creator',
      description: 'Generate professional Jira tickets and create them directly in your instance',
      icon: Ticket,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  if (activeTools) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setActiveTools(null)}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          
          {activeTools === 'youtube' && <YouTubeSummarizer />}
          {activeTools === 'social' && <SocialMediaGenerator />}
          {activeTools === 'comments' && <CommentGenerator />}
          {activeTools === 'jira' && <JiraTicketCreator />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Personal AI Toolbox
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Supercharge your productivity with AI-powered tools for content creation, analysis, and social media management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Card 
                key={tool.id}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
                onClick={() => setActiveTools(tool.id)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${tool.color} p-4 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-full h-full text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg`}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white/60 rounded-full backdrop-blur-sm border border-gray-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-gray-700 font-medium">AI-Powered Tools Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
