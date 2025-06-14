
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Copy, RefreshCw, Loader2, Linkedin, Hash, Instagram, Youtube } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const CommentGenerator = () => {
  const [postContent, setPostContent] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [tone, setTone] = useState('professional');
  const [customContext, setCustomContext] = useState('');
  const [generatedComments, setGeneratedComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const platforms = [
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { value: 'twitter', label: 'X (Twitter)', icon: Hash, color: 'text-gray-900' },
    { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
    { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  ];

  const tones = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'supportive', label: 'Supportive', description: 'Encouraging and positive' },
    { value: 'inquisitive', label: 'Inquisitive', description: 'Asking thoughtful questions' },
    { value: 'appreciative', label: 'Appreciative', description: 'Grateful and thankful' },
    { value: 'constructive', label: 'Constructive', description: 'Adding valuable insights' },
    { value: 'humorous', label: 'Humorous', description: 'Light-hearted and witty' },
  ];

  const handleGenerate = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Post Content Required",
        description: "Please provide the post content you want to comment on.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockComments = {
        professional: [
          "This is an excellent perspective! Your insights really resonate with my experience in the field. Thank you for sharing.",
          "Great point about the importance of continuous learning. I've found that staying curious has been key to my professional growth.",
          "I completely agree with your analysis. This approach has proven effective in my own work as well.",
        ],
        friendly: [
          "Love this post! 🙌 Your perspective always brings such clarity to complex topics. Thanks for sharing!",
          "This really hit home for me! I've been thinking about this exact thing lately. Great minds think alike! 😊",
          "Such a refreshing take! Your posts always brighten my day and make me think differently.",
        ],
        supportive: [
          "Thank you for sharing this vulnerable and authentic perspective. Your courage to speak about this topic is inspiring! 💪",
          "I really admire your approach to this challenge. Your resilience and positive mindset are truly motivating!",
          "This post came at exactly the right time for me. Thank you for the encouragement and wisdom! 🌟",
        ],
        inquisitive: [
          "This is fascinating! I'm curious - have you noticed any specific strategies that work better in certain industries?",
          "Great insights! What would you say has been the biggest learning curve in implementing this approach?",
          "Really interesting perspective! How do you balance this with other competing priorities?",
        ],
        appreciative: [
          "Thank you for consistently sharing such valuable content! Your expertise really shines through in every post.",
          "I'm grateful for leaders like you who take the time to share knowledge and experiences. This is incredibly helpful!",
          "Your content always adds so much value to my feed. Thank you for being such a positive influence in this space!",
        ],
        constructive: [
          "Building on your point, I've also found that combining this approach with regular feedback loops can amplify the results.",
          "Excellent framework! In my experience, adding a focus on stakeholder communication can make implementation even smoother.",
          "This aligns perfectly with recent research in the field. Have you considered how this might scale in larger organizations?",
        ],
        humorous: [
          "This is so true it hurts! 😅 Thanks for putting into words what we've all been thinking but were too polite to say.",
          "Finally, someone said it! Now if only we could get this printed on coffee mugs for the entire office 😂",
          "You've officially become my favorite person today for saying what needed to be said! 🎯",
        ],
      };

      const comments = mockComments[tone] || mockComments.professional;
      setGeneratedComments(comments);
      
      toast({
        title: "Comments Generated!",
        description: `Generated ${comments.length} thoughtful comments in ${tones.find(t => t.value === tone)?.label.toLowerCase()} tone.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (comment) => {
    navigator.clipboard.writeText(comment);
    toast({
      title: "Copied!",
      description: "Comment copied to clipboard.",
    });
  };

  const selectedPlatform = platforms.find(p => p.value === platform);
  const PlatformIcon = selectedPlatform?.icon || MessageSquare;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl mb-4">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Comment Generator</h1>
        <p className="text-gray-600">Generate thoughtful, engaging comments for social media interactions</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlatformIcon className={`w-5 h-5 ${selectedPlatform?.color}`} />
              Comment Configuration
            </CardTitle>
            <CardDescription>
              Provide the post content and set your commenting preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="post-content">Original Post Content</Label>
              <Textarea
                id="post-content"
                placeholder="Paste the post content you want to comment on..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="mt-1 min-h-[150px]"
              />
            </div>

            <div>
              <Label htmlFor="platform">Platform</Label>
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
              <Label htmlFor="tone">Comment Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <div className="font-medium">{t.label}</div>
                        <div className="text-sm text-gray-500">{t.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="custom-context">Additional Context (Optional)</Label>
              <Textarea
                id="custom-context"
                placeholder="Any specific points you want to address or your relationship to the topic..."
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Generate Comments
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                Generated Comments
                {generatedComments.length > 0 && (
                  <Badge variant="outline">{generatedComments.length} options</Badge>
                )}
              </div>
              {generatedComments.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Choose from AI-generated comment options
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-purple-500" />
                  <p className="text-gray-600">Crafting thoughtful comments...</p>
                </div>
              </div>
            ) : generatedComments.length > 0 ? (
              <div className="space-y-4">
                {generatedComments.map((comment, index) => (
                  <div 
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg border hover:border-purple-200 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-sm leading-relaxed flex-1">{comment}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(comment)}
                        className="flex-shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Option {index + 1} • {comment.length} characters
                    </div>
                  </div>
                ))}
                <div className="text-xs text-gray-500 mt-4">
                  <p>Tone: {tones.find(t => t.value === tone)?.label}</p>
                  <p>Platform: {selectedPlatform?.label}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Your generated comments will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommentGenerator;
