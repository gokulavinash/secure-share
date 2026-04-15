import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { fileAPI } from '@/lib/api';

interface UploadFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function UploadFilesDialog({ open, onOpenChange, onSuccess }: UploadFilesDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 2) {
      toast.error('Maximum 2 files allowed');
      return;
    }
    
    const oversizedFiles = selectedFiles.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Each file must be less than 10MB');
      return;
    }
    
    setFiles(selectedFiles);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    if (!recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('recipientEmail', recipientEmail);

      const response = await fileAPI.uploadFiles(formData);
      toast.success(response.message);
      
      // Reset form
      setFiles([]);
      setRecipientEmail('');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload up to 2 files (max 10MB each) to share with another user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="files">Select Files (Max 2)</Label>
            <Input
              id="files"
              type="file"
              multiple
              onChange={handleFileChange}
              accept="*/*"
              disabled={uploading}
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files:</Label>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recipient Email */}
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              disabled={uploading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
