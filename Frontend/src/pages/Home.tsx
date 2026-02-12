import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import VideoCard from '@/components/video/VideoCard';
import { Button } from '@/components/ui/button';
import { categories } from '@/lib/mockData';
import type { Video } from '@/lib/mockData';
import { getVideos } from '@/lib/api';
import { cn } from '@/lib/utils';

const Home = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getVideos()
      .then((data) => {
        if (!cancelled) setVideos(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load videos');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredVideos = useMemo(() => {
    let list = videos;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query) ||
          video.author.username.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      list = list.filter((video) => video.category === selectedCategory);
    }

    return list;
  }, [videos, searchQuery, selectedCategory]);

  return (
    <MainLayout>
      <div className="p-4 sm:p-6">
        {/* Category filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <Button
              key={category}
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                selectedCategory === category
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Search results header */}
        {searchQuery && (
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">
              Search results for "{searchQuery}"
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Loading / Error */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-muted-foreground">Loading videos...</p>
          </div>
        )}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-destructive">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">Make sure the backend is running on port 5000.</p>
          </div>
        )}

        {/* Video grid */}
        {!loading && !error && filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : !loading && !error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 text-6xl">🎬</div>
            <h2 className="text-xl font-semibold text-foreground">No videos found</h2>
            <p className="mt-2 text-muted-foreground">
              {searchQuery
                ? 'Try different search terms or explore other categories'
                : 'No videos in this category yet'}
            </p>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default Home;
