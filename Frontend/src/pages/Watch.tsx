import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Flag,
  Download,
  MoreHorizontal,
  Eye,
  Trash2,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import VideoPlayer from '@/components/video/VideoPlayer';
import VideoCard from '@/components/video/VideoCard';
import CommentSection from '@/components/video/CommentSection';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { mockComments, formatViews, formatDate, Video } from '@/lib/mockData';
import {
  getVideo,
  getVideos,
  incrementVideoView,
  updateVideoReaction,
  updateVideoSubscribers,
  checkSubscriptionStatus,
  deleteVideo,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Watch = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [subscribers, setSubscribers] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRecordedView, setHasRecordedView] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch video and related videos
  useEffect(() => {
    if (!videoId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setHasRecordedView(false); // Reset view record on new video

    getVideo(videoId)
      .then((v) => {
        if (cancelled) return;
        if (v) {
          setVideo(v);
          setViews(v.views);
          setLikes(v.likes);
          setDislikes(v.dislikes);
          setSubscribers(v.author.subscribers);
        } else {
          setVideo(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load video');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!socket || !videoId) return;

    socket.emit('join_video', videoId);

    const handleViewUpdate = (data: { views: number }) => {
      setViews(data.views);
    };

    const handleReactionUpdate = (data: { likes: number; dislikes: number }) => {
      setLikes(data.likes);
      setDislikes(data.dislikes);
    };

    const handleSubscriberUpdate = (data: { subscribers: number }) => {
      setSubscribers(data.subscribers);
    };

    socket.on('view_updated', handleViewUpdate);
    socket.on('reaction_updated', handleReactionUpdate);
    socket.on('subscriber_updated', handleSubscriberUpdate);

    return () => {
      socket.off('view_updated', handleViewUpdate);
      socket.off('reaction_updated', handleReactionUpdate);
      socket.off('subscriber_updated', handleSubscriberUpdate);
      // Optional: leave room
    };
  }, [socket, videoId]);

  useEffect(() => {
    if (!videoId) return;
    getVideos()
      .then((list) => {
        setRelatedVideos(list.filter((v) => v.id !== videoId).slice(0, 5));
      })
      .catch(() => setRelatedVideos([]));
  }, [videoId]);

  // Fetch subscription status on load
  useEffect(() => {
    if (!videoId || !isAuthenticated) return;
    checkSubscriptionStatus(videoId)
      .then((status) => {
        if (status) {
          setIsSubscribed(status.isSubscribed);
          setSubscribers(status.subscribers);
        }
      })
      .catch(() => { });
  }, [videoId, isAuthenticated]);

  const videoComments = mockComments.filter(c => c.videoId === videoId);

  const handleViewStart = () => {
    if (!video || !isAuthenticated || hasRecordedView) return;

    setHasRecordedView(true);
    // Optimistic update
    setViews(prev => prev + 1);

    incrementVideoView(video.id)
      .then((updated) => {
        if (updated) {
          setViews(updated.views);
        }
      })
      .catch(() => {
        // If backend update fails, don't break the UI – counts will resync on next load
      });
  };

  const handleReaction = (type: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like or dislike videos.',
        variant: 'destructive',
      });
      return;
    }
    if (!video) return;

    // Optimistic UI update
    if (userReaction === type) {
      // Toggle off
      setUserReaction(null);
      if (type === 'like') setLikes(prev => Math.max(0, prev - 1));
      else setDislikes(prev => Math.max(0, prev - 1));
    } else {
      // Switch or new reaction
      if (userReaction === 'like') setLikes(prev => Math.max(0, prev - 1));
      if (userReaction === 'dislike') setDislikes(prev => Math.max(0, prev - 1));
      setUserReaction(type);
      if (type === 'like') setLikes(prev => prev + 1);
      else setDislikes(prev => prev + 1);
    }

    // Single API call — backend handles toggle/switch logic internally
    updateVideoReaction(video.id, type)
      .then((updated) => {
        if (updated) {
          setLikes(updated.likes);
          setDislikes(updated.dislikes);
        }
      })
      .catch(() => { });
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to subscribe.',
        variant: 'destructive',
      });
      return;
    }
    if (!video) return;

    // Optimistic UI update
    const nextSubscribed = !isSubscribed;
    setIsSubscribed(nextSubscribed);
    setSubscribers(prev => Math.max(0, prev + (nextSubscribed ? 1 : -1)));

    updateVideoSubscribers(video.id)
      .then((result) => {
        if (result) {
          // Sync with actual backend values
          setSubscribers(result.subscribers);
          setIsSubscribed(result.isSubscribed);
        }
      })
      .catch(() => { });

    toast({
      title: nextSubscribed ? 'Subscribed!' : 'Unsubscribed',
      description: nextSubscribed
        ? `You're now subscribed to ${video.author.username}`
        : `You unsubscribed from ${video.author.username}`,
    });
  };

  const handleDelete = async () => {
    if (!video) return;
    setIsDeleting(true);
    try {
      await deleteVideo(video.id);
      toast({
        title: 'Video deleted',
        description: 'Your video has been successfully deleted.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = user && video && user.id === video.author.id;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button asChild className="mt-4">
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!video) {
    return (
      <MainLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Video not found</h1>
            <p className="mt-2 text-muted-foreground">This video doesn't exist or has been removed.</p>
            <Button asChild className="mt-4">
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-4 lg:flex-row lg:p-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Video Player */}
          <VideoPlayer
            src={video.videoUrl}
            poster={video.thumbnail}
            onViewStart={handleViewStart}
          />

          {/* Video info */}
          <div className="mt-4">
            <div className="flex items-start justify-between">
              <h1 className="text-xl font-semibold text-foreground lg:text-2xl">
                {video.title}
              </h1>

              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your video
                        and remove the data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Stats and actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link to={`/profile/${video.author.id}`} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {video.author.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground hover:text-primary transition-colors">
                      {video.author.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatViews(subscribers)} subscribers
                    </p>
                  </div>
                </Link>

                <Button
                  onClick={handleSubscribe}
                  className={cn(
                    'rounded-full px-6',
                    isSubscribed
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      : 'bg-foreground text-background hover:bg-foreground/90'
                  )}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Like/Dislike */}
                <div className="flex items-center overflow-hidden rounded-full bg-secondary">
                  <Button
                    variant="ghost"
                    onClick={() => handleReaction('like')}
                    className={cn(
                      'gap-2 rounded-l-full rounded-r-none px-4 hover:bg-accent',
                      userReaction === 'like' && 'bg-accent'
                    )}
                  >
                    <ThumbsUp className={cn('h-5 w-5', userReaction === 'like' && 'fill-current')} />
                    <span>{formatViews(likes)}</span>
                  </Button>
                  <Separator orientation="vertical" className="h-6 bg-border" />
                  <Button
                    variant="ghost"
                    onClick={() => handleReaction('dislike')}
                    className={cn(
                      'rounded-l-none rounded-r-full px-4 hover:bg-accent',
                      userReaction === 'dislike' && 'bg-accent'
                    )}
                  >
                    <ThumbsDown className={cn('h-5 w-5', userReaction === 'dislike' && 'fill-current')} />
                  </Button>
                </div>

                <Button variant="secondary" className="gap-2 rounded-full">
                  <Share2 className="h-5 w-5" />
                  Share
                </Button>

                <Button variant="secondary" size="icon" className="rounded-full">
                  <Download className="h-5 w-5" />
                </Button>

                <Button variant="secondary" size="icon" className="rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 rounded-xl bg-secondary p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatViews(views)} views
                </span>
                <span>•</span>
                <span>{formatDate(video.uploadedAt)}</span>
              </div>
              <p className={cn(
                'mt-2 whitespace-pre-wrap text-sm text-foreground',
                !showFullDescription && 'line-clamp-3'
              )}>
                {video.description}
              </p>
              <Button
                variant="link"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-1 h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </Button>
            </div>

            {/* Comments */}
            <CommentSection comments={videoComments} videoId={video.id} />
          </div>
        </div>

        {/* Sidebar - Related videos */}
        <aside className="w-full shrink-0 lg:w-96">
          <h3 className="mb-4 font-semibold text-foreground">Related Videos</h3>
          <div className="space-y-4">
            {relatedVideos.map(v => (
              <VideoCard key={v.id} video={v} layout="list" />
            ))}
          </div>
        </aside>
      </div>
    </MainLayout>
  );
};

export default Watch;
