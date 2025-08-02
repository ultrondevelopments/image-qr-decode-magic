import SimplePeer from 'simple-peer';

export interface P2PLink {
  id: string;
  originalUrl: string;
  shortUrl: string;
  title: string;
  description?: string;
  expiresAt: Date;
  createdAt: Date;
  clicks: number;
  sharedBy?: string;
}

export interface P2PConnection {
  id: string;
  peer: SimplePeer.Instance;
  isConnected: boolean;
  isInitiator: boolean;
  remoteId?: string;
  connectionCode?: string;
}

class P2PService {
  private connections: Map<string, P2PConnection> = new Map();
  private onLinkReceived?: (link: P2PLink) => void;
  private onConnectionStatusChange?: (connectionId: string, isConnected: boolean) => void;
  private signalingData: any = null;

  constructor() {
    // Initialize any global P2P setup
  }

  // Generate a unique connection ID
  private generateConnectionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Create a new P2P connection as initiator
  createConnection(): P2PConnection {
    const connectionId = this.generateConnectionId();
    
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]
      }
    });

    const connection: P2PConnection = {
      id: connectionId,
      peer,
      isConnected: false,
      isInitiator: true,
    };

    this.setupPeerEventHandlers(peer, connectionId);
    this.connections.set(connectionId, connection);

    return connection;
  }

  // Join an existing P2P connection using signaling data
  joinConnection(signalingData: any): P2PConnection | null {
    const connectionId = this.generateConnectionId();
    
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]
      }
    });

    const connection: P2PConnection = {
      id: connectionId,
      peer,
      isConnected: false,
      isInitiator: false,
      remoteId: signalingData.id,
    };

    this.setupPeerEventHandlers(peer, connectionId);
    this.connections.set(connectionId, connection);

    // Signal to the initiator
    peer.signal(signalingData);

    return connection;
  }

  private setupPeerEventHandlers(peer: SimplePeer.Instance, connectionId: string) {
    peer.on('signal', (data) => {
      // Store the signaling data for sharing
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.connectionCode = JSON.stringify(data);
      }
      console.log('Connection signal generated:', data);
    });

    peer.on('connect', () => {
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.isConnected = true;
        this.onConnectionStatusChange?.(connectionId, true);
      }
      console.log('P2P connection established');
    });

    peer.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'link-share' && message.link) {
          // Convert the received link data to proper Date objects
          const link: P2PLink = {
            ...message.link,
            expiresAt: new Date(message.link.expiresAt),
            createdAt: new Date(message.link.createdAt),
          };
          this.onLinkReceived?.(link);
        }
      } catch (error) {
        console.error('Error parsing P2P message:', error);
      }
    });

    peer.on('close', () => {
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.isConnected = false;
        this.onConnectionStatusChange?.(connectionId, false);
      }
      console.log('P2P connection closed');
    });

    peer.on('error', (error) => {
      console.error('P2P connection error:', error);
    });
  }

  // Share a link with a connected peer
  shareLink(connectionId: string, link: P2PLink): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isConnected) {
      return false;
    }

    const message = {
      type: 'link-share',
      link: {
        ...link,
        sharedBy: 'peer',
        createdAt: new Date().toISOString(),
        expiresAt: link.expiresAt.toISOString(),
      }
    };

    connection.peer.send(JSON.stringify(message));
    return true;
  }

  // Get connection code for sharing
  getConnectionCode(connectionId: string): string | null {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isInitiator || !connection.connectionCode) {
      return null;
    }

    return connection.connectionCode;
  }

  // Close a connection
  closeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.peer.destroy();
      this.connections.delete(connectionId);
    }
  }

  // Get all active connections
  getConnections(): P2PConnection[] {
    return Array.from(this.connections.values());
  }

  // Set event handlers
  onLinkReceived(handler: (link: P2PLink) => void): void {
    this.onLinkReceived = handler;
  }

  onConnectionStatusChange(handler: (connectionId: string, isConnected: boolean) => void): void {
    this.onConnectionStatusChange = handler;
  }

  // Cleanup all connections
  destroy(): void {
    this.connections.forEach((connection) => {
      connection.peer.destroy();
    });
    this.connections.clear();
  }
}

// Export a singleton instance
export const p2pService = new P2PService();