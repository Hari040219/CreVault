import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Image, X, Video, Loader2 } from 'lucide-react';
import axios from 'axios';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/lib/mockData';
import { getApiBase } from '@/lib/api';

const Upload = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to upload videos.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit for demo
        toast({
          title: 'File too large',
          description: 'Please select a video under 100MB.',
          variant: 'destructive',
        });
        return;
      }
      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast({
        title: 'Video required',
        description: 'Please select a video file to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!title || !category) {
      toast({
        title: 'Missing fields',
        description: 'Please provide a title and category.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('video', videoFile);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      if (user) {
        formData.append('authorId', user.id);
        formData.append('authorName', user.username);
        formData.append('authorAvatar', user.avatar);
      }

      const apiBase = getApiBase();
      const url = apiBase ? `${apiBase}/api/videos/upload` : '/api/videos/upload';

      // Get token from localStorage
      const storedUser = localStorage.getItem('streamtube_user');
      const token = storedUser ? JSON.parse(storedUser).token : null;

      // Do NOT set Content-Type manually — axios must auto-set it
      // with the correct multipart boundary when sending FormData
      const headers: Record<string, string> = {};

      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await axios.post(url, formData, {
        headers,
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      toast({
        title: 'Video uploaded!',
        description: 'Your video has been uploaded successfully.',
      });

      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (error: any) {
      console.error('Upload error:', error);

      let errorMessage = 'There was a problem uploading your video. Please try again.';

      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Upload Video</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video upload */}
          <div className="rounded-xl border border-dashed border-border bg-card p-8">
            {videoFile ? (
              <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{videoFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeVideo}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-4 text-center"
                onClick={() => videoInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    videoInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Select video file to upload"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <UploadIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drag and drop video files to upload
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your videos will be private until you publish them.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="default"
                  className="bg-primary text-primary-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    videoInputRef.current?.click();
                  }}
                >
                  Select files
                </Button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                  tabIndex={-1}
                  aria-hidden
                />
              </div>
            )}
          </div>

          {/* Video details */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter video title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                  className="border-border bg-secondary text-foreground"
                />
                <p className="text-xs text-muted-foreground">{title.length}/100</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell viewers about your video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  maxLength={5000}
                  className="resize-none border-border bg-secondary text-foreground"
                />
                <p className="text-xs text-muted-foreground">{description.length}/5000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-border bg-secondary text-foreground">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover">
                    {categories.filter(c => c !== 'All').map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label className="text-foreground">Thumbnail</Label>
              <div className="aspect-video overflow-hidden rounded-xl border border-dashed border-border bg-card">
                {thumbnailPreview ? (
                  <div className="relative h-full">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={removeThumbnail}
                      className="absolute right-2 top-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 text-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload thumbnail</p>
                    <p className="text-xs text-muted-foreground">1280x720 recommended</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="rounded-xl bg-secondary p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Uploading...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !videoFile}
              className="bg-primary text-primary-foreground"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Publish'
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default Upload;
