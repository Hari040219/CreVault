import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Video, 
  Eye, 
  TrendingUp, 
  Trash2, 
  Ban,
  MoreVertical,
  Search,
  ChevronDown,
  Play,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { mockUsers, mockVideos, formatViews, User, Video as VideoType } from '@/lib/mockData';

const Admin = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>(mockUsers.filter(u => u.role !== 'admin'));
  const [videos, setVideos] = useState<VideoType[]>(mockVideos);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!isAdmin) {
      toast({
        title: 'Access denied',
        description: 'You need admin privileges to access this page.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);

  // Calculate stats
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);

  const handleDeleteVideo = (videoId: string) => {
    setVideos(videos.filter(v => v.id !== videoId));
    toast({
      title: 'Video deleted',
      description: 'The video has been permanently deleted.',
    });
  };

  const handleBlockUser = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u
    ));
    const user = users.find(u => u.id === userId);
    toast({
      title: user?.isBlocked ? 'User unblocked' : 'User blocked',
      description: `${user?.username} has been ${user?.isBlocked ? 'unblocked' : 'blocked'}.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    setVideos(videos.filter(v => v.author.id !== userId));
    toast({
      title: 'User deleted',
      description: 'The user and their content have been deleted.',
    });
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.author.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendUp 
  }: { 
    title: string; 
    value: string; 
    icon: React.ElementType; 
    trend?: string;
    trendUp?: boolean;
  }) => (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${trendUp ? 'text-success' : 'text-destructive'}`}>
              {trendUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {trend}
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );

  if (!isAdmin) return null;

  return (
    <MainLayout>
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage users, videos, and view analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={users.length.toString()}
            icon={Users}
            trend="+12% this month"
            trendUp
          />
          <StatCard
            title="Total Videos"
            value={videos.length.toString()}
            icon={Video}
            trend="+8% this month"
            trendUp
          />
          <StatCard
            title="Total Views"
            value={formatViews(totalViews)}
            icon={Eye}
            trend="+23% this month"
            trendUp
          />
          <StatCard
            title="Engagement Rate"
            value="4.2%"
            icon={TrendingUp}
            trend="-2% this month"
            trendUp={false}
          />
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users or videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border bg-secondary text-foreground"
            />
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6 bg-secondary">
            <TabsTrigger value="users" className="data-[state=active]:bg-background">
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-background">
              Videos ({videos.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-background">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Subscribers</TableHead>
                    <TableHead className="text-muted-foreground">Joined</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.username} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {user.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="text-foreground">{formatViews(user.subscribers)}</TableCell>
                      <TableCell className="text-muted-foreground">{user.createdAt}</TableCell>
                      <TableCell>
                        <Badge variant={user.isBlocked ? 'destructive' : 'secondary'}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link to={`/profile/${user.id}`}>View Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              onClick={() => handleBlockUser(user.id)}
                              className="cursor-pointer"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              {user.isBlocked ? 'Unblock' : 'Block'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Video</TableHead>
                    <TableHead className="text-muted-foreground">Author</TableHead>
                    <TableHead className="text-muted-foreground">Views</TableHead>
                    <TableHead className="text-muted-foreground">Likes</TableHead>
                    <TableHead className="text-muted-foreground">Uploaded</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.map(video => (
                    <TableRow key={video.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <span className="line-clamp-2 max-w-xs font-medium text-foreground">
                            {video.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{video.author.username}</TableCell>
                      <TableCell className="text-foreground">{formatViews(video.views)}</TableCell>
                      <TableCell className="text-foreground">{formatViews(video.likes)}</TableCell>
                      <TableCell className="text-muted-foreground">{video.uploadedAt}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link to={`/watch/${video.id}`}>Watch Video</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteVideo(video.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Most Viewed Videos */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">Most Viewed Videos</h3>
                <div className="space-y-4">
                  {topVideos.map((video, index) => (
                    <div key={video.id} className="flex items-center gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="line-clamp-1 text-sm font-medium text-foreground">
                          {video.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatViews(video.views)} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Stats */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">Platform Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Total Watch Time</span>
                    <span className="font-medium text-foreground">1,234,567 hours</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Average Session</span>
                    <span className="font-medium text-foreground">12 min 34 sec</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Total Comments</span>
                    <span className="font-medium text-foreground">45,678</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Daily Active Users</span>
                    <span className="font-medium text-foreground">2,345</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Storage Used</span>
                    <span className="font-medium text-foreground">1.2 TB / 5 TB</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
