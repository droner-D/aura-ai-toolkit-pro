
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Youtube, FileText, Download, Loader2, Languages } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = "http://localhost:8000"; // Update this with your backend URL

const YouTubeSummarizer = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [outputType, setOutputType] = useState('summary');
  const [customPrompt, setCustomPrompt] = useState('');
  const [language, setLanguage] = useState('english');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('url');
  const { toast } = useToast();

  const outputTypes = [
    { value: 'summary', label: 'Summary', description: 'Concise overview of key points' },
    { value: 'notes', label: 'Detailed Notes', description: 'Structured bullet points and insights' },
    { value: 'explanation', label: 'Easy Explanation', description: 'Simplified explanation for better understanding' },
    { value: 'questions', label: 'Key Questions', description: 'Important questions and answers from content' },
    { value: 'custom', label: 'Custom Request', description: 'Specify your own requirements' },
  ];

  const handleProcess = async () => {
    if (!videoUrl && !transcript) {
      toast({
        title: "Input Required",
        description: "Please provide either a YouTube URL or transcript text.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call Python backend API based on input type
      let response;
      
      if (activeTab === 'url') {
        response = await fetch(`${BACKEND_URL}/api/youtube/summarize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_url: videoUrl,
            output_type: outputType,
            language: language,
            custom_prompt: outputType === 'custom' ? customPrompt : undefined
          }),
        });
      } else {
        response = await fetch(`${BACKEND_URL}/api/transcript/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript: transcript,
            output_type: outputType,
            language: language,
            custom_prompt: outputType === 'custom' ? customPrompt : undefined
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.result);
      
      toast({
        title: "Processing Complete!",
        description: "Your content has been successfully analyzed.",
      });
    } catch (error) {
      console.error("Error processing request:", error);
      toast({
        title: "Processing Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-analysis-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful!",
      description: "Your analysis has been downloaded as a markdown file.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl mb-4">
          <Youtube className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">YouTube Video Summarizer</h1>
        <p className="text-gray-600">Extract insights and create summaries from YouTube videos</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Input & Configuration
            </CardTitle>
            <CardDescription>
              Provide your YouTube video URL or paste transcript directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">YouTube URL</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="space-y-4">
                <div>
                  <Label htmlFor="video-url">YouTube Video URL</Label>
                  <Input
                    id="video-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="language">Transcript Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="transcript" className="space-y-4">
                <div>
                  <Label htmlFor="transcript-text">Paste Transcript</Label>
                  <Textarea
                    id="transcript-text"
                    placeholder="Paste your video transcript here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="mt-1 min-h-[200px]"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div>
              <Label htmlFor="output-type">Output Type</Label>
              <Select value={outputType} onValueChange={setOutputType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outputTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {outputType === 'custom' && (
              <div>
                <Label htmlFor="custom-prompt">Custom Requirements</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="Describe what you want to extract from the video..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            <Button 
              onClick={handleProcess}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Analyze Video'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Content
              </span>
              {result && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              AI-generated analysis will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-red-500" />
                  <p className="text-gray-600">Analyzing video content...</p>
                </div>
              </div>
            ) : result ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {result}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Your generated content will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YouTubeSummarizer;
