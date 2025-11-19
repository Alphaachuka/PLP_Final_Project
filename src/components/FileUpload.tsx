import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, File, Image, FileText } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<any>;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const FileUpload = ({ 
  onUpload, 
  acceptedTypes = ['image/*'], 
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  className = '',
  children
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0]; // Handle single file for now
    
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await onUpload(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: 'Upload successful',
        description: 'File uploaded successfully'
      });

      return result;
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [onUpload, maxSize, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    multiple,
    disabled: uploading
  });

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="h-8 w-8" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  if (children) {
    return (
      <div {...getRootProps()} className={className}>
        <input {...getInputProps()} />
        {children}
        {uploading && (
          <div className="mt-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-1">Uploading... {progress}%</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card 
      {...getRootProps()} 
      className={`p-6 border-2 border-dashed cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
      } ${uploading ? 'pointer-events-none opacity-50' : ''} ${className}`}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin mx-auto">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Uploading...</p>
              <Progress value={progress} className="w-full mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto text-muted-foreground">
              {getFileIcon(acceptedTypes[0] || 'file')}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<any>;
  className?: string;
}

export const AvatarUpload = ({ currentAvatar, onUpload, className = '' }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await onUpload(file);
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully'
      });
      return result;
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload avatar',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif']}
      maxSize={5 * 1024 * 1024} // 5MB
      className={className}
    >
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {currentAvatar ? (
            <img 
              src={currentAvatar} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl text-muted-foreground">
              👤
            </div>
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <div className="animate-spin">
              <Upload className="h-6 w-6 text-white" />
            </div>
          ) : (
            <Upload className="h-6 w-6 text-white" />
          )}
        </div>
      </div>
    </FileUpload>
  );
};