import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Users, Share2, Copy, ArrowRight } from 'lucide-react';

const P2PInstructions = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          How to Use P2P Sharing
        </CardTitle>
        <CardDescription>
          Follow these steps to share links directly with other users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Host Instructions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium">As a Host (Sharing Links)</h3>
              </div>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">1</Badge>
                  <span>Click "Create Connection" to start a P2P session</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">2</Badge>
                  <span>Copy the generated connection code</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">3</Badge>
                  <span>Share the code with the person you want to connect with</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">4</Badge>
                  <span>Wait for them to join, then select and share your links</span>
                </li>
              </ol>
            </div>

            {/* Guest Instructions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-green-600" />
                <h3 className="font-medium">As a Guest (Receiving Links)</h3>
              </div>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">1</Badge>
                  <span>Get the connection code from the host</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">2</Badge>
                  <span>Paste the code in the "Join Connection" field</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">3</Badge>
                  <span>Click "Join Connection" to connect</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">4</Badge>
                  <span>Wait for the host to share links with you</span>
                </li>
              </ol>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Important Notes
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Both users need to be online at the same time</li>
              <li>• Connection codes are temporary and expire when the session ends</li>
              <li>• Links shared via P2P will appear in your "Shared Links" section</li>
              <li>• You can have multiple P2P connections active at once</li>
              <li>• The connection uses WebRTC for direct peer-to-peer communication</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default P2PInstructions;