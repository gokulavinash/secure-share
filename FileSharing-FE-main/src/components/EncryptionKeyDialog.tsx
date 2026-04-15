import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Key, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { userAPI } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EncryptionKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKey: string | null;
  onSuccess: () => void;
}

export default function EncryptionKeyDialog({ open, onOpenChange, currentKey, onSuccess }: EncryptionKeyDialogProps) {
  const [customKey, setCustomKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateKey = async () => {
    try {
      setLoading(true);
      const response = await userAPI.generateEncryptionKey();
      toast.success('Encryption key generated successfully!');
      toast.info('Please save your key securely. You will need it for file operations.');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate key');
    } finally {
      setLoading(false);
    }
  };

  const handleSetCustomKey = async () => {
    if (!customKey) {
      toast.error('Please enter an encryption key');
      return;
    }

    if (!/^[a-fA-F0-9]{64}$/.test(customKey)) {
      toast.error('Invalid key format. Must be 64 hexadecimal characters.');
      return;
    }

    try {
      setLoading(true);
      await userAPI.updateEncryptionKey(customKey);
      toast.success('Encryption key updated successfully!');
      setCustomKey('');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update key');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Key copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Encryption Key Management
          </DialogTitle>
          <DialogDescription>
            Your encryption key is used to encrypt and decrypt files. Keep it secure!
          </DialogDescription>
        </DialogHeader>

        {currentKey && (
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Your Current Encryption Key:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-xs break-all">
                    {showKey ? currentKey : '•'.repeat(64)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(currentKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate New Key</TabsTrigger>
            <TabsTrigger value="custom">Set Custom Key</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">
                Generate a new random 256-bit encryption key. This will be used to encrypt all your files.
              </p>
              
              {currentKey && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Warning: Generating a new key will replace your current key. Make sure you've downloaded all files encrypted with the old key first.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleGenerateKey} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>Generating...</>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate New Key
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customKey">Custom Encryption Key</Label>
                <Input
                  id="customKey"
                  type="text"
                  placeholder="Enter 64 hexadecimal characters"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  disabled={loading}
                  maxLength={64}
                />
                <p className="text-xs text-gray-500">
                  Must be exactly 64 hexadecimal characters (0-9, a-f)
                </p>
              </div>

              <Button 
                onClick={handleSetCustomKey} 
                disabled={loading || !customKey}
                className="w-full"
              >
                {loading ? (
                  <>Setting Key...</>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Set Custom Key
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
