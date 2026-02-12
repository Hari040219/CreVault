import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, formatViews, formatDate } from '@/lib/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VideoCardProps {
  video: Video;
  layout?: 'grid' | 'list';
}

const VideoCard: React.FC<VideoCardProps> = ({ video, layout = 'grid' }) => {
  const navigate = useNavigate();

  const goToVideo = () => navigate(`/watch/${video.id}`);

  if (layout === 'list') {
    return (
      <div
        onClick={goToVideo}
        className="group flex cursor-pointer gap-4"
        role="link"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') goToVideo(); }}
      >
        <div className="video-thumbnail w-64 shrink-0">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="video-duration">{video.duration}</span>
        </div>

        <div className="flex flex-col gap-2 py-1">
          <h3 className="line-clamp-2 text-lg font-medium text-foreground group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatDate(video.uploadedAt)}</span>
          </div>
          <Link
            to={`/profile/${video.author.id}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {video.author.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span>{video.author.username}</span>
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">{video.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={goToVideo}
      className="video-card group animate-fade-in cursor-pointer"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') goToVideo(); }}
    >
      <div className="video-thumbnail">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="video-duration">{video.duration}</span>
      </div>

      <div className="flex gap-3 p-3">
        <Link
          to={`/profile/${video.author.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {video.author.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 overflow-hidden">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <Link
            to={`/profile/${video.author.id}`}
            className="mt-1 block text-sm text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            {video.author.username}
          </Link>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatDate(video.uploadedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
