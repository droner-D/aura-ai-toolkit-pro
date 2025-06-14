import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Hash, Linkedin, MessageSquare, Copy, Download, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = "http://localhost:8000"; // Update this with your backend URL

const SocialMediaGenerator = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [writingStyle, setWritingStyle] = useState('professional');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const platforms = [
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { value: 'twitter', label: 'X (Twitter)', icon: Hash, color: 'text-gray-900' },
    { value: 'youtube', label: 'YouTube Story', icon: MessageSquare, color: 'text-red-600' },
    { value: 'instagram', label: 'Instagram', icon: Hash, color: 'text-pink-600' },
  ];

  const writingStyles = [
    { value: 'professional', label: 'Professional', description: 'Formal, business-oriented tone' },
    { value: 'casual', label: 'Casual', description: 'Friendly, conversational approach' },
    { value: 'inspirational', label: 'Inspirational', description: 'Motivational and uplifting' },
    { value: 'educational', label: 'Educational', description: 'Informative and teaching-focused' },
    { value: 'humorous', label: 'Humorous', description: 'Light-hearted with appropriate humor' },
    { value: 'thought-provoking', label: 'Thought-Provoking', description: 'Encourages discussion and reflection' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please provide a topic or idea for your post.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call Python backend API
      const response = await fetch(`${BACKEND_URL}/api/social/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          platform: platform,
          writing_style: writingStyle,
          custom_instructions: customInstructions || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedPost(data.result);
      
      toast({
        title: "Post Generated!",
        description: `Your ${platforms.find(p => p.value === platform)?.label} post is ready.`,
      });
    } catch (error) {
      console.error("Error generating post:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    toast({
      title: "Copied!",
      description: "Post content copied to clipboard.",
    });
  };

  const handleExport = () => {
    const blob = new Blob([generatedPost], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${platform}-post-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful!",
      description: "Your post has been downloaded as a text file.",
    });
  };

  const selectedPlatform = platforms.find(p => p.value === platform);
  const PlatformIcon = selectedPlatform?.icon || Hash;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4">
          <Hash className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Post Generator</h1>
        <p className="text-gray-600">Create engaging content for all your social platforms</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlatformIcon className={`w-5 h-5 ${selectedPlatform?.color}`} />
              Content Configuration
            </CardTitle>
            <CardDescription>
              Set up your post parameters and style preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="topic">Topic or Idea</Label>
              <Textarea
                id="topic"
                placeholder="What do you want to post about? (e.g., productivity tips, career advice, personal experience...)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="platform">Target Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => {
                    const Icon = p.icon;
                    return (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${p.color}`} />
                          {p.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="writing-style">Writing Style</Label>
              <Select value={writingStyle} onValueChange={setWritingStyle}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {writingStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-sm text-gray-500">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="custom-instructions">Custom Instructions (Optional)</Label>
              <Textarea
                id="custom-instructions"
                placeholder="Any specific requirements, tone adjustments, or additional context..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Hash className="w-4 h-4 mr-2" />
                  Generate Post
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlatformIcon className={`w-5 h-5 ${selectedPlatform?.color}`} />
                Generated Post
                <Badge variant="outline">{selectedPlatform?.label}</Badge>
              </div>
              {generatedPost && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Your AI-generated social media post
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
                  <p className="text-gray-600">Crafting your perfect post...</p>
                </div>
              </div>
            ) : generatedPost ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {generatedPost}
                  </pre>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Character count: {generatedPost.length}</p>
                  <p>Style: {writingStyles.find(s => s.value === writingStyle)?.label}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Your generated post will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialMediaGenerator;
