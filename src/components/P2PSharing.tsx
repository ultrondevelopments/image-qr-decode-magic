import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Share2, Users, Wifi, WifiOff, CheckCircle, XCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { p2pService, P2PConnection, P2PLink } from '@/lib/p2p-service';

interface P2PSharingProps {
  links: P2PLink[];
  onLinkReceived: (link: P2PLink) => void;
}

const P2PSharing = ({ links, onLinkReceived }: P2PSharingProps) => {
  const [connections, setConnections] = useState<P2PConnection[]>([]);
  const [connectionCode, setConnectionCode] = useState('');
  const [selectedLink, setSelectedLink] = useState<string>('');
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [isJoiningConnection, setIsJoiningConnection] = useState(false);
  const [isP2PSupported, setIsP2PSupported] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Debug logging
  console.log('P2PSharing component rendered:', {
    linksCount: links.length,
    connectionsCount: connections.length,
    isP2PSupported,
    selectedLink
  });

  useEffect(() => {
    // Check if WebRTC is supported
    const checkP2PSupport = () => {
      try {
        // More comprehensive WebRTC check
        const isSupported = !!(
          typeof window !== 'undefined' &&
          window.RTCPeerConnection &&
          window.navigator &&
          window.navigator.mediaDevices &&
          window.navigator.mediaDevices.getUserMedia &&
          // Check if we're in a secure context (required for WebRTC)
          (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
        );
        
        console.log('WebRTC support check:', {
          hasRTCPeerConnection: !!window.RTCPeerConnection,
          hasMediaDevices: !!(window.navigator && window.navigator.mediaDevices),
          hasGetUserMedia: !!(window.navigator && window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia),
          isSecureContext: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
          isSupported
        });
        
        setIsP2PSupported(isSupported);
        
        if (isSupported) {
          // Set up event handlers
          p2pService.onLinkReceived(onLinkReceived);
          p2pService.onConnectionStatusChange((connectionId, isConnected) => {
            setConnections(prev => 
              prev.map(conn => 
                conn.id === connectionId 
                  ? { ...conn, isConnected } 
                  : conn
              )
            );
          });
        }
      } catch (error) {
        console.error('P2P support check failed:', error);
        setIsP2PSupported(false);
      }
    };

    checkP2PSupport();

    // Cleanup on unmount
    return () => {
      if (isP2PSupported) {
        p2pService.destroy();
      }
    };
  }, [onLinkReceived, isP2PSupported]);

  const createConnection = async () => {
    if (!isP2PSupported) {
      toast({
        title: "P2P not supported",
        description: "Your browser doesn't support WebRTC. Please use a modern browser.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingConnection(true);
    
    try {
      const connection = p2pService.createConnection();
      setConnections(prev => [...prev, connection]);
      
      toast({
        title: "Connection created",
        description: "Share the connection code with someone to start sharing links.",
      });
    } catch (error) {
      console.error('Failed to create connection:', error);
      toast({
        title: "Connection failed",
        description: "Failed to create P2P connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConnection(false);
    }
  };

  const joinConnection = async () => {
    if (!isP2PSupported) {
      toast({
        title: "P2P not supported",
        description: "Your browser doesn't support WebRTC. Please use a modern browser.",
        variant: "destructive",
      });
      return;
    }

    if (!connectionCode.trim()) {
      toast({
        title: "Connection code required",
        description: "Please enter a valid connection code.",
        variant: "destructive",
      });
      return;
    }

    setIsJoiningConnection(true);
    
    try {
      // Parse the connection code (should be JSON)
      const signalingData = JSON.parse(connectionCode);
      const connection = p2pService.joinConnection(signalingData);
      if (connection) {
        setConnections(prev => [...prev, connection]);
        setConnectionCode('');
        
        toast({
          title: "Connection joined",
          description: "Successfully joined the P2P connection.",
        });
      } else {
        throw new Error('Failed to join connection');
      }
    } catch (error) {
      console.error('Failed to join connection:', error);
      toast({
        title: "Connection failed",
        description: "Failed to join the P2P connection. Please check the code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoiningConnection(false);
    }
  };

  const shareLink = (connectionId: string) => {
    if (!selectedLink) {
      toast({
        title: "No link selected",
        description: "Please select a link to share.",
        variant: "destructive",
      });
      return;
    }

    const link = links.find(l => l.id === selectedLink);
    if (!link) {
      toast({
        title: "Link not found",
        description: "The selected link could not be found.",
        variant: "destructive",
      });
      return;
    }

    const success = p2pService.shareLink(connectionId, link);
    if (success) {
      toast({
        title: "Link shared",
        description: "The link has been shared successfully.",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Failed to share the link. Please check the connection.",
        variant: "destructive",
      });
    }
  };

  const closeConnection = (connectionId: string) => {
    p2pService.closeConnection(connectionId);
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    
    toast({
      title: "Connection closed",
      description: "The P2P connection has been closed.",
    });
  };

  const copyConnectionCode = (connectionId: string) => {
    const code = p2pService.getConnectionCode(connectionId);
    if (code) {
      navigator.clipboard.writeText(code);
      toast({
        title: "Code copied",
        description: "Connection code copied to clipboard.",
      });
    }
  };

  // Show loading state while checking P2P support
  if (isP2PSupported === null) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Wifi className="h-12 w-12 mx-auto mb-4 animate-pulse" />
            <p>Checking P2P support...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if P2P is not supported
  if (isP2PSupported === false) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            P2P Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support WebRTC, which is required for P2P sharing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="font-medium mb-2">WebRTC Not Available</p>
            <p className="text-sm mb-4">
              P2P sharing requires WebRTC support, which is not available in your browser.
            </p>
            <div className="space-y-2 text-sm">
              <p>Please try:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Using a modern browser (Chrome, Firefox, Safari, Edge)</li>
                <li>Enabling WebRTC in your browser settings</li>
                <li>Using HTTPS or localhost (WebRTC requires secure context)</li>
                <li>Checking if you're behind a restrictive firewall</li>
                <li>Disabling any WebRTC-blocking browser extensions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For testing purposes, show a simplified version if P2P is not working
  const showSimplifiedVersion = true; // Set to true for testing

  if (showSimplifiedVersion) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            P2P Link Sharing (Test Mode)
          </CardTitle>
          <CardDescription>
            Simplified test version - P2P functionality disabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-700">
                ✅ Component is rendering correctly! 
              </p>
              <p className="text-sm text-green-600 mt-1">
                Links available: {links.length} | P2P Supported: {isP2PSupported ? 'Yes' : 'No'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create Connection</CardTitle>
                  <CardDescription>
                    Start a new P2P connection and share the code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => toast({ title: "Test", description: "Create connection clicked" })}
                    className="w-full"
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    Create Connection (Test)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Join Connection</CardTitle>
                  <CardDescription>
                    Connect to someone else's P2P session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="connection-code">Connection Code</Label>
                    <Input
                      id="connection-code"
                      placeholder="Enter connection code"
                    />
                  </div>
                  <Button 
                    onClick={() => toast({ title: "Test", description: "Join connection clicked" })}
                    className="w-full"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Join Connection (Test)
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Links</CardTitle>
                <CardDescription>
                  Links that can be shared via P2P
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {links.map((link) => (
                    <div key={link.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{link.title}</p>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          P2P Link Sharing
        </CardTitle>
        <CardDescription>
          Share links directly with other users using peer-to-peer connections
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Test button to verify component is working */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 mb-2">
            <strong>Debug Info:</strong> Component is rendering correctly
          </p>
          <p className="text-xs text-blue-600">
            Links: {links.length} | Connections: {connections.length} | P2P Supported: {isP2PSupported ? 'Yes' : 'No'}
          </p>
        </div>
        
        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="share">Share Links</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create Connection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create Connection</CardTitle>
                  <CardDescription>
                    Start a new P2P connection and share the code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={createConnection} 
                    disabled={isCreatingConnection}
                    className="w-full"
                  >
                    {isCreatingConnection ? (
                      <>
                        <Wifi className="h-4 w-4 mr-2 animate-pulse" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Wifi className="h-4 w-4 mr-2" />
                        Create Connection
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Join Connection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Join Connection</CardTitle>
                  <CardDescription>
                    Connect to someone else's P2P session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="connection-code">Connection Code</Label>
                    <Input
                      id="connection-code"
                      value={connectionCode}
                      onChange={(e) => setConnectionCode(e.target.value)}
                      placeholder="Enter connection code"
                    />
                  </div>
                  <Button 
                    onClick={joinConnection} 
                    disabled={isJoiningConnection || !connectionCode.trim()}
                    className="w-full"
                  >
                    {isJoiningConnection ? (
                      <>
                        <Wifi className="h-4 w-4 mr-2 animate-pulse" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Join Connection
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Active Connections */}
            {connections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {connections.map((connection) => (
                      <div
                        key={connection.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {connection.isConnected ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">
                              {connection.isInitiator ? 'Host' : 'Guest'} Connection
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {connection.id.slice(0, 8)}...
                            </p>
                          </div>
                          <Badge variant={connection.isConnected ? "default" : "secondary"}>
                            {connection.isConnected ? "Connected" : "Connecting"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {connection.isInitiator && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyConnectionCode(connection.id)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Code
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => closeConnection(connection.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="share" className="space-y-4">
            {connections.filter(c => c.isConnected).length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active connections</p>
                    <p className="text-sm">Create or join a connection to start sharing links</p>
                  </div>
                </CardContent>
              </Card>
            ) : links.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No links available to share</p>
                    <p className="text-sm">Create some links in the Link Manager tab first</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share Links</CardTitle>
                  <CardDescription>
                    Select a link and share it with connected peers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="link-select">Select Link</Label>
                    <Select value={selectedLink} onValueChange={setSelectedLink}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a link to share" />
                      </SelectTrigger>
                      <SelectContent>
                        {links.map((link) => (
                          <SelectItem key={link.id} value={link.id}>
                            {link.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Connected Peers:</p>
                    {connections
                      .filter(connection => connection.isConnected)
                      .map((connection) => (
                        <div
                          key={connection.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">
                                {connection.isInitiator ? 'Host' : 'Guest'} Peer
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ID: {connection.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => shareLink(connection.id)}
                            disabled={!selectedLink}
                            size="sm"
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default P2PSharing;