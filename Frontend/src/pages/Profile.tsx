import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, Video as VideoIcon, Settings, Eye, ThumbsUp } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import VideoCard from '@/components/video/VideoCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatViews, formatDate, Video } from '@/lib/mockData';
import { getUserProfile, getUserVideos, ApiUserProfile } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [profileUser, setProfileUser] = useState<ApiUserProfile | null>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.id === userId;

  // Fetch profile and videos from the backend
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getUserProfile(userId),
      getUserVideos(userId),
    ])
      .then(([profile, videos]) => {
        if (cancelled) return;
        setProfileUser(profile);
        setUserVideos(videos);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const totalViews = userVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = userVideos.reduce((acc, v) => acc + (v.likes || 0), 0);

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

  if (!profileUser) {
    return (
      <MainLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">User not found</h1>
            <p className="mt-2 text-muted-foreground">This channel doesn't exist.</p>
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
      <div className="p-4 sm:p-6">
        {/* Banner */}
        <div className="h-32 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-secondary sm:h-48" />

        {/* Profile header */}
        <div className="relative -mt-16 mb-6 flex flex-col items-start gap-4 px-4 sm:flex-row sm:items-end sm:px-6">
          <Avatar className="h-24 w-24 border-4 border-background sm:h-32 sm:w-32">
            <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
              {profileUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {profileUser.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {formatViews(profileUser.subscribers)} subscribers
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <VideoIcon className="h-4 w-4" />
                  {userVideos.length} videos
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(profileUser.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {isOwnProfile && (
                <Button variant="secondary" className="gap-2" asChild>
                  <Link to="/dashboard">
                    <Settings className="h-4 w-4" />
                    Manage Channel
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats row for own profile */}
        {isOwnProfile && (
          <div className="mb-6 grid grid-cols-1 gap-4 px-4 sm:grid-cols-3 sm:px-6">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <VideoIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Videos</p>
                <p className="text-xl font-bold text-foreground">{userVideos.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Eye className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-xl font-bold text-foreground">{formatViews(totalViews)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                <ThumbsUp className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Likes</p>
                <p className="text-xl font-bold text-foreground">{formatViews(totalLikes)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="videos" className="mt-6">
          <TabsList className="h-12 w-full justify-start gap-4 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="videos"
              className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-6">
            {userVideos.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {userVideos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <VideoIcon className="mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground">No videos yet</h2>
                <p className="mt-2 text-muted-foreground">
                  {isOwnProfile
                    ? 'Upload your first video to get started!'
                    : 'This channel hasn\'t uploaded any videos yet.'}
                </p>
                {isOwnProfile && (
                  <Button asChild className="mt-4 bg-primary text-primary-foreground">
                    <Link to="/upload">Upload a video</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="max-w-2xl space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Description</h3>
                <p className="mt-2 text-muted-foreground">
                  Welcome to {profileUser.name}'s channel! Stay tuned for awesome content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Stats</h3>
                <div className="mt-2 space-y-1 text-muted-foreground">
                  <p>Joined {formatDate(profileUser.createdAt)}</p>
                  <p>{formatViews(totalViews)} total views</p>
                  <p>{userVideos.length} videos</p>
                  <p>{formatViews(profileUser.subscribers)} subscribers</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
