import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Clock, 
  ThumbsUp, 
  ListVideo, 
  Flame, 
  Music2, 
  Gamepad2, 
  Newspaper,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  const mainLinks = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
  ];

  const libraryLinks = [
    { icon: Clock, label: 'Watch Later', path: '/playlist/watch-later' },
    { icon: ThumbsUp, label: 'Liked Videos', path: '/playlist/liked' },
    { icon: ListVideo, label: 'Your Videos', path: '/your-videos' },
  ];

  const categoryLinks = [
    { icon: Flame, label: 'Trending', path: '/?category=Trending' },
    { icon: Music2, label: 'Music', path: '/?category=Music' },
    { icon: Gamepad2, label: 'Gaming', path: '/?category=Gaming' },
    { icon: Newspaper, label: 'News', path: '/?category=News' },
  ];

  const renderNavItem = (icon: React.ElementType, label: string, path: string) => {
    const Icon = icon;
    const isActive = location.pathname === path || 
      (path.includes('?') && location.search.includes(path.split('?')[1]));

    return (
      <Link
        key={path}
        to={path}
        className={cn(
          'sidebar-item',
          isActive && 'active',
          !isOpen && 'flex-col gap-1 px-0 py-4 text-[10px]'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', !isOpen && 'h-6 w-6')} />
        <span className={cn(!isOpen && 'text-center')}>{label}</span>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] overflow-y-auto border-r border-sidebar-border bg-sidebar transition-all duration-300',
        isOpen ? 'w-60' : 'w-[72px]'
      )}
    >
      <nav className="flex flex-col gap-1 p-2">
        {/* Main Links */}
        <div className="space-y-1">
          {mainLinks.map(link => renderNavItem(link.icon, link.label, link.path))}
        </div>

        {isOpen && <div className="my-3 border-t border-sidebar-border" />}

        {/* Library - Only show when authenticated and sidebar is open */}
        {isAuthenticated && isOpen && (
          <>
            <h3 className="mb-2 px-3 text-sm font-semibold text-sidebar-foreground">Library</h3>
            <div className="space-y-1">
              {libraryLinks.map(link => renderNavItem(link.icon, link.label, link.path))}
            </div>
            <div className="my-3 border-t border-sidebar-border" />
          </>
        )}

        {/* Categories */}
        {isOpen && (
          <>
            <h3 className="mb-2 px-3 text-sm font-semibold text-sidebar-foreground">Explore</h3>
            <div className="space-y-1">
              {categoryLinks.map(link => renderNavItem(link.icon, link.label, link.path))}
            </div>
          </>
        )}

        {/* Admin Link */}
        {isAdmin && isOpen && (
          <>
            <div className="my-3 border-t border-sidebar-border" />
            {renderNavItem(Settings, 'Admin Panel', '/admin')}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
