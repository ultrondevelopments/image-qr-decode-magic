
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimePicker } from '@/components/ui/time-picker';
import { CalendarIcon, Copy, ExternalLink, Plus, Trash2, Clock, BarChart3, QrCode, Scan, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import QRScanner from '@/components/QRScanner';
import P2PSharing from '@/components/P2PSharing';
import SharedLinks from '@/components/SharedLinks';
import P2PInstructions from '@/components/P2PInstructions';
import { P2PLink } from '@/lib/p2p-service';

interface Link {
  id: string;
  originalUrl: string;
  shortUrl: string;
  title: string;
  description?: string;
  expiresAt: Date;
  createdAt: Date;
  clicks: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<'links' | 'qr' | 'p2p'>('links');
  const [links, setLinks] = useState<Link[]>([]);
  const [sharedLinks, setSharedLinks] = useState<P2PLink[]>([]);
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const generateShortUrl = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createLink = async () => {
    if (!originalUrl || !title || !expiryDate) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newLink: Link = {
      id: Date.now().toString(),
      originalUrl,
      shortUrl: generateShortUrl(),
      title,
      description,
      expiresAt: expiryDate,
      createdAt: new Date(),
      clicks: 0,
    };

    setLinks([newLink, ...links]);
    setOriginalUrl('');
    setTitle('');
    setDescription('');
    setExpiryDate(undefined);
    setIsCreating(false);

    toast({
      title: "Link created successfully!",
      description: "Your link has been created and is ready to use.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The link has been copied to your clipboard.",
    });
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
    toast({
      title: "Link deleted",
      description: "The link has been permanently deleted.",
    });
  };

  const handleLinkReceived = (link: P2PLink) => {
    setSharedLinks(prev => [link, ...prev]);
    toast({
      title: "Link received!",
      description: `"${link.title}" has been shared with you via P2P.`,
    });
  };

  const isExpired = (date: Date) => {
    return new Date() > date;
  };

  const getTimeUntilExpiry = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (activeTab === 'qr') {
    return <QRScanner />;
  }

  if (activeTab === 'p2p') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">P2P Link Sharing</h1>
              <p className="text-gray-600">Share links directly with other users using peer-to-peer connections</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab('links')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Back to Links
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <P2PSharing links={links} onLinkReceived={handleLinkReceived} />
            </div>
            <div className="space-y-6">
              <P2PInstructions />
              <SharedLinks sharedLinks={sharedLinks} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">LinkExpiry</h1>
            <p className="text-gray-600">Create secure links that expire automatically</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/analytics'}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/pricing'}
              className="flex items-center gap-2"
            >
              Pricing
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <Button
              onClick={() => setActiveTab('links')}
              variant={activeTab === 'links' ? 'default' : 'ghost'}
              className={`gap-2 ${activeTab === 'links' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
            >
              <ExternalLink className="h-4 w-4" />
              Link Manager
            </Button>
            <Button
              onClick={() => setActiveTab('qr')}
              variant={activeTab === 'qr' ? 'default' : 'ghost'}
              className={`gap-2 ${activeTab === 'qr' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
            >
              <QrCode className="h-4 w-4" />
              QR Scanner
            </Button>
            <Button
              onClick={() => setActiveTab('p2p')}
              variant={activeTab === 'p2p' ? 'default' : 'ghost'}
              className={`gap-2 ${activeTab === 'p2p' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
            >
              <Share2 className="h-4 w-4" />
              P2P Sharing
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Link Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Link
                </CardTitle>
                <CardDescription>
                  Create a secure link with an expiry date
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter link title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Original URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expiry Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={expiryDate}
                        onSelect={(date) => {
                          if (date) {
                            const newDate = new Date(date);
                            if (expiryDate) {
                              newDate.setHours(expiryDate.getHours(), expiryDate.getMinutes(), 0, 0);
                            } else {
                              newDate.setHours(12, 0, 0, 0);
                            }
                            setExpiryDate(newDate);
                          } else {
                            setExpiryDate(undefined);
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Expiry Time *</Label>
                  <TimePicker date={expiryDate} setDate={setExpiryDate} />
                </div>

                <Button 
                  onClick={createLink} 
                  className="w-full" 
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Link'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Links List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Links</CardTitle>
                <CardDescription>
                  Manage your created links
                </CardDescription>
              </CardHeader>
              <CardContent>
                {links.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No links created yet</p>
                    <p className="text-sm">Create your first link to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{link.title}</h3>
                              {isExpired(link.expiresAt) ? (
                                <Badge variant="destructive">Expired</Badge>
                              ) : (
                                <Badge variant="secondary">
                                  {getTimeUntilExpiry(link.expiresAt)}
                                </Badge>
                              )}
                            </div>
                            
                            {link.description && (
                              <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                            )}
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Original:</span>
                                <a
                                  href={link.originalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  {link.originalUrl}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Short Link:</span>
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {window.location.origin}/l/{link.shortUrl}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(`${window.location.origin}/l/${link.shortUrl}`)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <span>Clicks: {link.clicks}</span>
                              <span>Created: {format(link.createdAt, 'MMM d, yyyy')}</span>
                              <span>Expires: {format(link.expiresAt, 'MMM d, yyyy HH:mm')}</span>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLink(link.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
