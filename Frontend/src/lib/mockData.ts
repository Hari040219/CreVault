// Mock data for the video streaming platform

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  createdAt: string;
  subscribers: number;
  isBlocked?: boolean;
  token?: string; // JWT token for authentication
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  dislikes: number;
  uploadedAt: string;
  author: User;
  category: string;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'TechMaster',
    email: 'techmaster@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    role: 'user',
    createdAt: '2024-01-15',
    subscribers: 125000,
  },
  {
    id: '2',
    username: 'CreativeStudio',
    email: 'creative@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    role: 'user',
    createdAt: '2024-02-20',
    subscribers: 89000,
  },
  {
    id: '3',
    username: 'GamingPro',
    email: 'gaming@example.com',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    role: 'user',
    createdAt: '2024-03-10',
    subscribers: 250000,
  },
  {
    id: '4',
    username: 'MusicVibes',
    email: 'music@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    role: 'user',
    createdAt: '2024-01-05',
    subscribers: 450000,
  },
  {
    id: 'admin',
    username: 'Admin',
    email: 'admin@streamtube.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    role: 'admin',
    createdAt: '2023-12-01',
    subscribers: 0,
  },
];

export const mockVideos: Video[] = [
  {
    id: 'v1',
    title: 'Building a Modern Web App with React and TypeScript',
    description: 'Learn how to build production-ready web applications using React, TypeScript, and modern best practices. We cover component architecture, state management, and deployment strategies.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '24:35',
    views: 0,
    likes: 0,
    dislikes: 0,
    uploadedAt: '2024-12-15',
    author: mockUsers[0],
    category: 'Technology',
  },
  {
    id: 'v2',
    title: 'Cinematic Travel Vlog: Exploring Japan in 4K',
    description: 'Join me on an incredible journey through Japan! From the bustling streets of Tokyo to the serene temples of Kyoto, experience the beauty of Japan in stunning 4K.',
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '18:42',
    views: 892100,
    likes: 45200,
    dislikes: 340,
    uploadedAt: '2024-11-28',
    author: mockUsers[1],
    category: 'Travel',
  },
  {
    id: 'v3',
    title: 'Epic Gaming Moments Compilation 2024',
    description: 'The most insane gaming moments of 2024! Watch incredible plays, funny fails, and mind-blowing clutches from the biggest games of the year.',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '32:18',
    views: 2450000,
    likes: 156000,
    dislikes: 2100,
    uploadedAt: '2024-12-01',
    author: mockUsers[2],
    category: 'Gaming',
  },
  {
    id: 'v4',
    title: 'Lo-Fi Beats to Study and Relax',
    description: 'Chill beats perfect for studying, working, or relaxing. Let the smooth lo-fi hip hop wash over you as you focus on what matters.',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '1:45:00',
    views: 5670000,
    likes: 320000,
    dislikes: 890,
    uploadedAt: '2024-10-15',
    author: mockUsers[3],
    category: 'Music',
  },
  {
    id: 'v5',
    title: 'Advanced CSS Animations Tutorial',
    description: 'Master CSS animations and transitions. Learn keyframes, timing functions, and how to create smooth, performant animations for your websites.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    duration: '28:15',
    views: 89000,
    likes: 6200,
    dislikes: 85,
    uploadedAt: '2024-12-10',
    author: mockUsers[0],
    category: 'Technology',
  },
  {
    id: 'v6',
    title: 'Street Photography Tips for Beginners',
    description: 'Learn essential street photography techniques to capture compelling urban stories. Tips on composition, timing, and camera settings.',
    thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    duration: '15:30',
    views: 156000,
    likes: 12400,
    dislikes: 180,
    uploadedAt: '2024-11-20',
    author: mockUsers[1],
    category: 'Education',
  },
  {
    id: 'v7',
    title: 'Pro Gaming Setup Tour 2024',
    description: 'Check out my ultimate gaming setup! From the RGB lighting to the dual monitor setup, see what gear I use for streaming and competitive gaming.',
    thumbnail: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    duration: '12:45',
    views: 780000,
    likes: 45000,
    dislikes: 620,
    uploadedAt: '2024-12-05',
    author: mockUsers[2],
    category: 'Gaming',
  },
  {
    id: 'v8',
    title: 'Piano Cover: Popular Songs Medley',
    description: 'A beautiful piano medley featuring the most popular songs of 2024. Perfect for background music while you work or relax.',
    thumbnail: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: '22:10',
    views: 340000,
    likes: 28000,
    dislikes: 150,
    uploadedAt: '2024-11-30',
    author: mockUsers[3],
    category: 'Music',
  },
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    videoId: 'v1',
    userId: '2',
    username: 'CreativeStudio',
    avatar: mockUsers[1].avatar,
    content: 'This is exactly what I needed! The TypeScript tips are gold. Thanks for sharing!',
    createdAt: '2024-12-16',
    likes: 245,
  },
  {
    id: 'c2',
    videoId: 'v1',
    userId: '3',
    username: 'GamingPro',
    avatar: mockUsers[2].avatar,
    content: 'Great tutorial! Can you do one on Next.js 14 features?',
    createdAt: '2024-12-16',
    likes: 89,
  },
  {
    id: 'c3',
    videoId: 'v1',
    userId: '4',
    username: 'MusicVibes',
    avatar: mockUsers[3].avatar,
    content: 'Been looking for a good React tutorial. This is perfect!',
    createdAt: '2024-12-17',
    likes: 56,
  },
  {
    id: 'c4',
    videoId: 'v2',
    userId: '1',
    username: 'TechMaster',
    avatar: mockUsers[0].avatar,
    content: 'The cinematography is absolutely stunning! Japan looks amazing.',
    createdAt: '2024-11-29',
    likes: 1200,
  },
  {
    id: 'c5',
    videoId: 'v3',
    userId: '1',
    username: 'TechMaster',
    avatar: mockUsers[0].avatar,
    content: 'That clutch at 15:30 was INSANE! How did you pull that off?',
    createdAt: '2024-12-02',
    likes: 3400,
  },
];

export const categories = [
  'All',
  'Technology',
  'Gaming',
  'Music',
  'Travel',
  'Education',
  'Entertainment',
  'Sports',
  'News',
  'Comedy',
];

export const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};
