import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, Video, Settings } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import VideoCard from '@/components/video/VideoCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockUsers, mockVideos, formatViews } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const profileUser = mockUsers.find(u => u.id === userId) || 
    (currentUser?.id === userId ? currentUser : null);

  const userVideos = mockVideos.filter(v => v.author.id === userId);
  const isOwnProfile = currentUser?.id === userId;

  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to subscribe.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubscribed(!isSubscribed);
    toast({
      title: isSubscribed ? 'Unsubscribed' : 'Subscribed!',
      description: isSubscribed 
        ? `You unsubscribed from ${profileUser?.username}`
        : `You're now subscribed to ${profileUser?.username}`,
    });
  };

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
              {profileUser.username.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {profileUser.username}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {formatViews(profileUser.subscribers)} subscribers
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  {userVideos.length} videos
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {profileUser.createdAt}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button variant="secondary" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Customize channel
                </Button>
              ) : (
                <Button
                  onClick={handleSubscribe}
                  className={
                    isSubscribed
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      : 'bg-foreground text-background hover:bg-foreground/90'
                  }
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              )}
            </div>
          </div>
        </div>

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
              value="playlists"
              className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Playlists
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
                <Video className="mb-4 h-16 w-16 text-muted-foreground" />
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

          <TabsContent value="playlists" className="mt-6">
            <div className="flex flex-col items-center justify-center py-20">
              <h2 className="text-xl font-semibold text-foreground">No playlists</h2>
              <p className="mt-2 text-muted-foreground">
                Playlists will appear here when created.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="max-w-2xl space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Description</h3>
                <p className="mt-2 text-muted-foreground">
                  Welcome to {profileUser.username}'s channel! Stay tuned for awesome content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Stats</h3>
                <p className="mt-2 text-muted-foreground">
                  Joined {profileUser.createdAt}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
