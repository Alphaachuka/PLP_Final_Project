import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FileUpload, AvatarUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, File, Image, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const TestFileUpload = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    try {
      const result = await api.uploadAvatar(file);
      console.log('Avatar upload result:', result);
      return result;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  };

  const handleGenericUpload = async (file: File) => {
    try {
      // For testing, we'll create a dummy course/job to upload to
      toast({
        title: 'Test Upload',
        description: `Would upload ${file.name} (${Math.round(file.size / 1024)}KB)`,
      });
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return { success: true, fileName: file.name };
    } catch (error) {
      console.error('Generic upload error:', error);
      throw error;
    }
  };

  const loadUserFiles = async () => {
    setLoading(true);
    try {
      const userFiles = await api.getMyFiles();
      setFiles(userFiles);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-primary flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Upload className="h-10 w-10 text-primary" />
            File Upload Test
          </h1>
          <p className="text-muted-foreground">Test the file upload functionality</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Avatar Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Avatar Upload</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a profile picture (max 5MB, images only)
            </p>
            <div className="flex justify-center">
              <AvatarUpload
                currentAvatar={profile?.avatarUrl}
                onUpload={handleAvatarUpload}
              />
            </div>
          </Card>

          {/* Generic File Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Generic File Upload</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Test file upload with different file types
            </p>
            <FileUpload
              onUpload={handleGenericUpload}
              acceptedTypes={['image/*', 'application/pdf', 'text/*']}
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </Card>

          {/* Course Material Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Course Materials</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload course materials (PDF, images, documents)
            </p>
            <FileUpload
              onUpload={handleGenericUpload}
              acceptedTypes={[
                'application/pdf',
                'image/*',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ]}
              maxSize={50 * 1024 * 1024} // 50MB
            />
          </Card>

          {/* Job Attachments */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Job Attachments</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload job-related documents
            </p>
            <FileUpload
              onUpload={handleGenericUpload}
              acceptedTypes={[
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
              ]}
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </Card>
        </div>

        {/* User Files */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Files</h2>
            <Button onClick={loadUserFiles} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {files.avatar && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Profile Avatar</h3>
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <img 
                  src={files.avatar.url} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">Profile Picture</p>
                  <p className="text-sm text-muted-foreground">Current avatar</p>
                </div>
                <Badge>Avatar</Badge>
              </div>
            </div>
          )}

          {files.courseMaterials && files.courseMaterials.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Course Materials</h3>
              <div className="space-y-2">
                {files.courseMaterials.map((material: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <File className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{material.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {material.courseTitle} • {formatFileSize(material.fileSize)}
                      </p>
                    </div>
                    <Badge variant="outline">{material.fileType}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.jobAttachments && files.jobAttachments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Job Attachments</h3>
              <div className="space-y-2">
                {files.jobAttachments.map((attachment: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <File className="h-8 w-8 text-secondary" />
                    <div className="flex-1">
                      <p className="font-medium">{attachment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {attachment.jobTitle} • {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                    <Badge variant="outline">{attachment.fileType}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!files.avatar && (!files.courseMaterials || files.courseMaterials.length === 0) && 
            (!files.jobAttachments || files.jobAttachments.length === 0)) && (
            <div className="text-center py-8">
              <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">No files uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload some files using the forms above
              </p>
            </div>
          )}
        </Card>

        {/* Instructions */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2 text-blue-900">Setup Instructions</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>To enable file uploads, you need to:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Create a free Cloudinary account at cloudinary.com</li>
              <li>Get your Cloud Name, API Key, and API Secret</li>
              <li>Add them to your server/.env file</li>
              <li>Restart your server</li>
            </ol>
            <p className="mt-3">
              <strong>Note:</strong> Without Cloudinary setup, uploads will fail. 
              This page is for testing the upload functionality once configured.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestFileUpload;