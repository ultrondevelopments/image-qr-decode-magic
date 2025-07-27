import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

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

const LinkRedirect = () => {
  const { shortUrl } = useParams<{ shortUrl: string }>();
  const [link, setLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const findLink = async () => {
      if (!shortUrl) {
        setError('Invalid link');
        setLoading(false);
        return;
      }

      // Simulate API call to find link
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll create a mock link
      // In a real app, this would fetch from your database
      const mockLink: Link = {
        id: '1',
        originalUrl: 'https://example.com',
        shortUrl: shortUrl,
        title: 'Example Link',
        description: 'This is an example link for demonstration purposes',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        createdAt: new Date(),
        clicks: 0,
      };

      // Check if link exists (in real app, this would be a database lookup)
      if (shortUrl === 'demo') {
        setLink(mockLink);
      } else {
        setError('Link not found');
      }
      
      setLoading(false);
    };

    findLink();
  }, [shortUrl]);

  const handleRedirect = () => {
    if (link) {
      // In a real app, you would increment the click count here
      window.location.href = link.originalUrl;
    }
  };

  const isExpired = (date: Date) => {
    return new Date() > date;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Link Not Found</CardTitle>
            <CardDescription>
              The link you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/'}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isExpired(link.expiresAt)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-orange-600">Link Expired</CardTitle>
            <CardDescription>
              This link has expired and is no longer accessible.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              <p>Expired on: {format(link.expiresAt, 'PPP \'at\' HH:mm')}</p>
            </div>
            <Button onClick={() => window.location.href = '/'}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ExternalLink className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle>{link.title}</CardTitle>
          {link.description && (
            <CardDescription>{link.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Destination:</strong></p>
            <p className="break-all bg-gray-100 p-2 rounded text-xs">
              {link.originalUrl}
            </p>
            <p className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Expires: {format(link.expiresAt, 'PPP \'at\' HH:mm')}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleRedirect} className="flex-1">
              Continue to Link
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Cancel
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            By clicking "Continue to Link", you'll be redirected to an external website.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkRedirect;