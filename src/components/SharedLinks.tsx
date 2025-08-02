import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Clock, Users } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { P2PLink } from '@/lib/p2p-service';

interface SharedLinksProps {
  sharedLinks: P2PLink[];
}

const SharedLinks = ({ sharedLinks }: SharedLinksProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The link has been copied to your clipboard.",
    });
  };

  const isExpired = (date: Date) => {
    return isAfter(new Date(), date);
  };

  const getTimeUntilExpiry = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (sharedLinks.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Shared Links
          </CardTitle>
          <CardDescription>
            Links shared with you via P2P connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No shared links yet</p>
            <p className="text-sm">Links shared with you via P2P will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Shared Links ({sharedLinks.length})
        </CardTitle>
        <CardDescription>
          Links shared with you via P2P connections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sharedLinks.map((link) => (
            <div
              key={link.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{link.title}</h3>
                  {link.description && (
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Shared {format(new Date(link.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isExpired(link.expiresAt) ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : (
                    <Badge variant="secondary">
                      {getTimeUntilExpiry(link.expiresAt)}
                    </Badge>
                  )}
                  <Badge variant="outline">P2P Shared</Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded px-3 py-2 text-sm font-mono">
                  {window.location.origin}/l/{link.shortUrl}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${window.location.origin}/l/${link.shortUrl}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(link.originalUrl, '_blank')}
                  disabled={isExpired(link.expiresAt)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Clicks: {link.clicks}</span>
                <span>Expires: {format(link.expiresAt, 'MMM d, yyyy HH:mm')}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SharedLinks;