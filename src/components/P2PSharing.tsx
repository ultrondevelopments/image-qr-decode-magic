import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Share2, Users, Wifi, WifiOff, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
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
  const { toast } = useToast();

  useEffect(() => {
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

    // Cleanup on unmount
    return () => {
      p2pService.destroy();
    };
  }, [onLinkReceived]);

  const createConnection = async () => {
    setIsCreatingConnection(true);
    
    try {
      const connection = p2pService.createConnection();
      setConnections(prev => [...prev, connection]);
      
      toast({
        title: "Connection created",
        description: "Share the connection code with someone to start sharing links.",
      });
    } catch (error) {
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