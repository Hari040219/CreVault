import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Eye,
    ThumbsUp,
    Video as VideoIcon,
    Trash2,
    Upload,
    BarChart3,
    TrendingUp,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, deleteVideo } from '@/lib/api';
import { formatViews, formatDate, Video } from '@/lib/mockData';
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
} from '@/components/ui/alert-dialog';

interface Stats {
    totalVideos: number;
    totalViews: number;
    totalLikes: number;
    videos: Video[];
}

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchStats();
    }, [isAuthenticated, navigate]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to load dashboard data.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (videoId: string) => {
        setDeletingId(videoId);
        try {
            await deleteVideo(videoId);
            toast({
                title: 'Video deleted',
                description: 'Your video has been permanently removed.',
            });
            // Refresh stats
            await fetchStats();
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to delete video. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            </MainLayout>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Will redirect in useEffect
    }

    return (
        <MainLayout>
            <div className="mx-auto max-w-6xl p-4 lg:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Welcome back, <span className="font-medium text-foreground">{user.username}</span>
                        </p>
                    </div>
                    <Button asChild className="gap-2 rounded-full bg-primary px-6 hover:bg-primary/90">
                        <Link to="/upload">
                            <Upload className="h-4 w-4" />
                            Upload Video
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Total Videos */}
                    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                                <VideoIcon className="h-6 w-6 text-blue-500" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Total Videos</p>
                            <p className="mt-1 text-3xl font-bold text-foreground">
                                {stats?.totalVideos ?? 0}
                            </p>
                        </div>
                    </div>

                    {/* Total Views */}
                    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                                <Eye className="h-6 w-6 text-emerald-500" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                            <p className="mt-1 text-3xl font-bold text-foreground">
                                {formatViews(stats?.totalViews ?? 0)}
                            </p>
                        </div>
                    </div>

                    {/* Total Likes */}
                    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-rose-500/10 transition-transform group-hover:scale-110" />
                        <div className="relative">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10">
                                <ThumbsUp className="h-6 w-6 text-rose-500" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                            <p className="mt-1 text-3xl font-bold text-foreground">
                                {formatViews(stats?.totalLikes ?? 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Video List */}
                <div className="rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border p-6">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold text-foreground">Your Videos</h2>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {stats?.totalVideos ?? 0} video{(stats?.totalVideos ?? 0) !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {(!stats?.videos || stats.videos.length === 0) ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <VideoIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No videos yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Upload your first video to get started!
                            </p>
                            <Button asChild className="mt-4 gap-2 rounded-full">
                                <Link to="/upload">
                                    <Upload className="h-4 w-4" />
                                    Upload Video
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {stats.videos.map((video) => (
                                <div
                                    key={video.id}
                                    className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center"
                                >
                                    {/* Thumbnail */}
                                    <Link
                                        to={`/watch/${video.id}`}
                                        className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40"
                                    >
                                        {video.thumbnail ? (
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <VideoIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
                                            {video.duration}
                                        </span>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col gap-1">
                                        <Link
                                            to={`/watch/${video.id}`}
                                            className="line-clamp-2 font-medium text-foreground transition-colors hover:text-primary"
                                        >
                                            {video.title}
                                        </Link>
                                        <p className="line-clamp-1 text-sm text-muted-foreground">
                                            {video.description || 'No description'}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3.5 w-3.5" />
                                                {formatViews(video.views)} views
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp className="h-3.5 w-3.5" />
                                                {formatViews(video.likes)} likes
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <TrendingUp className="h-3.5 w-3.5" />
                                                {formatDate(video.uploadedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <div className="shrink-0">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sm:hidden lg:inline">Delete</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete "{video.title}"?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. The video, all its views, and reactions
                                                        will be permanently removed.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(video.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        {deletingId === video.id ? 'Deleting...' : 'Delete'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
