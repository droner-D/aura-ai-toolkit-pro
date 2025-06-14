
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, Wand2, Copy, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface JiraSettings {
  jiraUrl: string;
  username: string;
  apiToken: string;
  projectKey: string;
}

const JiraTicketCreator = () => {
  const [subject, setSubject] = useState('');
  const [roughDescription, setRoughDescription] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [jiraSettings, setJiraSettings] = useState<JiraSettings>({
    jiraUrl: '',
    username: '',
    apiToken: '',
    projectKey: ''
  });
  const [showJiraSettings, setShowJiraSettings] = useState(false);
  const [createdTicketUrl, setCreatedTicketUrl] = useState('');
  
  const { toast } = useToast();

  const ticketTypes = [
    { value: 'epic', label: 'Epic' },
    { value: 'story', label: 'User Story' },
    { value: 'task', label: 'Task' },
    { value: 'bug', label: 'Bug' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'feature', label: 'Feature' }
  ];

  const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

  const generateContent = async () => {
    if (!subject.trim() || !roughDescription.trim() || !ticketType) {
      toast({
        title: "Missing Information",
        description: "Please fill in subject, description, and ticket type.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/api/jira/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          rough_description: roughDescription,
          ticket_type: ticketType,
          priority
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.result);
      toast({
        title: "Content Generated",
        description: "AI has generated professional content for your Jira ticket."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createJiraTicket = async () => {
    if (!generatedContent.trim()) {
      toast({
        title: "No Content",
        description: "Please generate content first.",
        variant: "destructive"
      });
      return;
    }

    if (!jiraSettings.jiraUrl || !jiraSettings.username || !jiraSettings.apiToken || !jiraSettings.projectKey) {
      toast({
        title: "Missing Jira Settings",
        description: "Please configure your Jira settings first.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingTicket(true);
    try {
      const response = await fetch('http://localhost:8000/api/jira/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          content: generatedContent,
          ticket_type: ticketType,
          priority,
          jira_settings: jiraSettings
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Jira ticket');
      }

      const data = await response.json();
      setCreatedTicketUrl(data.ticket_url);
      toast({
        title: "Ticket Created",
        description: "Jira ticket has been created successfully!"
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create Jira ticket. Please check your settings and try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast({
        title: "Copied",
        description: "Content copied to clipboard!"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-6 w-6" />
            AI-Powered Jira Ticket Creator
          </CardTitle>
          <CardDescription>
            Generate professional Jira ticket content using AI and create tickets directly in your Jira instance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject/Title</Label>
              <Input
                id="subject"
                placeholder="Enter ticket subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticketType">Ticket Type</Label>
              <Select value={ticketType} onValueChange={setTicketType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ticket type" />
                </SelectTrigger>
                <SelectContent>
                  {ticketTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Rough Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a rough description of what needs to be done..."
              className="min-h-24"
              value={roughDescription}
              onChange={(e) => setRoughDescription(e.target.value)}
            />
          </div>

          <Button 
            onClick={generateContent} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Professional Content
              </>
            )}
          </Button>

          {/* Generated Content Section */}
          {generatedContent && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Content</h3>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                </div>
              </div>
            </>
          )}

          {/* Jira Integration Section */}
          {generatedContent && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Create Jira Ticket</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowJiraSettings(!showJiraSettings)}
                  >
                    {showJiraSettings ? 'Hide' : 'Show'} Jira Settings
                  </Button>
                </div>

                {showJiraSettings && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="jiraUrl">Jira URL</Label>
                        <Input
                          id="jiraUrl"
                          placeholder="https://your-domain.atlassian.net"
                          value={jiraSettings.jiraUrl}
                          onChange={(e) => setJiraSettings({...jiraSettings, jiraUrl: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="projectKey">Project Key</Label>
                        <Input
                          id="projectKey"
                          placeholder="PROJ"
                          value={jiraSettings.projectKey}
                          onChange={(e) => setJiraSettings({...jiraSettings, projectKey: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username/Email</Label>
                        <Input
                          id="username"
                          placeholder="your-email@domain.com"
                          value={jiraSettings.username}
                          onChange={(e) => setJiraSettings({...jiraSettings, username: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apiToken">API Token</Label>
                        <Input
                          id="apiToken"
                          type="password"
                          placeholder="Your Jira API token"
                          value={jiraSettings.apiToken}
                          onChange={(e) => setJiraSettings({...jiraSettings, apiToken: e.target.value})}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Get your API token from: Jira Settings → Security → API tokens
                    </p>
                  </div>
                )}

                <Button 
                  onClick={createJiraTicket} 
                  disabled={isCreatingTicket}
                  className="w-full"
                >
                  {isCreatingTicket ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Ticket...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Create Jira Ticket
                    </>
                  )}
                </Button>

                {createdTicketUrl && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 font-medium">Ticket created successfully!</p>
                    <a 
                      href={createdTicketUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mt-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Ticket in Jira
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JiraTicketCreator;
