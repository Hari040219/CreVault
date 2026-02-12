import type { Video } from '@/lib/mockData';

/** Backend API video shape (from Express/Mongo) */
export interface ApiVideo {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  duration?: string;
  views?: number;
  likes?: number;
  dislikes?: number;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  createdAt?: string;
  authorSubscribers?: number;
}

/** Base URL for API. In dev with Vite proxy use '' so /api goes to backend. */
export function getApiBase(): string {
  return import.meta.env.VITE_API_URL ?? '';
}

/** Map backend video to frontend Video type. */
export function mapApiVideoToVideo(api: ApiVideo, baseUrl: string = getApiBase()): Video {
  const authorId = api.authorId ?? api._id;
  const authorName = api.authorName ?? 'Unknown';
  const authorAvatar = api.authorAvatar ?? '';
  const thumbnail = api.thumbnailUrl
    ? (api.thumbnailUrl.startsWith('http') ? api.thumbnailUrl : `${baseUrl.replace(/\/$/, '')}${api.thumbnailUrl}`)
    : '';
  const videoUrl = api.videoUrl.startsWith('http') ? api.videoUrl : `${baseUrl.replace(/\/$/, '')}${api.videoUrl}`;

  return {
    id: api._id,
    title: api.title,
    description: api.description ?? '',
    thumbnail,
    videoUrl,
    duration: api.duration ?? '0:00',
    views: api.views ?? 0,
    likes: api.likes ?? 0,
    dislikes: api.dislikes ?? 0,
    uploadedAt: api.createdAt ?? new Date().toISOString(),
    author: {
      id: authorId,
      username: authorName,
      email: '',
      avatar: authorAvatar,
      role: 'user',
      createdAt: '',
      subscribers: api.authorSubscribers ?? 0,
    },
    category: api.category ?? 'Other',
  };
}

export async function getVideos(): Promise<Video[]> {
  const base = getApiBase();
  const url = base ? `${base}/api/videos` : '/api/videos';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch videos: ${res.status}`);
  }
  const data: ApiVideo[] = await res.json();
  const apiBase = base || (typeof window !== 'undefined' ? window.location.origin : '');
  return data.map((v) => mapApiVideoToVideo(v, apiBase));
}

export async function getVideo(id: string): Promise<Video | null> {
  const base = getApiBase();
  const url = base ? `${base}/api/videos/${id}` : `/api/videos/${id}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch video: ${res.status}`);
  }
  const data: ApiVideo = await res.json();
  const apiBase = base || (typeof window !== 'undefined' ? window.location.origin : '');
  return mapApiVideoToVideo(data, apiBase);
}

export async function incrementVideoView(id: string): Promise<Video | null> {
  const base = getApiBase();
  const url = base ? `${base}/api/videos/${id}/view` : `/api/videos/${id}/view`;
  const res = await fetch(url, { method: 'POST' });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to increment views: ${res.status}`);
  }
  const data: ApiVideo = await res.json();
  const apiBase = base || (typeof window !== 'undefined' ? window.location.origin : '');
  return mapApiVideoToVideo(data, apiBase);
}

export async function updateVideoReaction(
  id: string,
  type: 'like' | 'dislike',
  delta: number
): Promise<Video | null> {
  const base = getApiBase();
  const url = base ? `${base}/api/videos/${id}/react` : `/api/videos/${id}/react`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, delta }),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to update reaction: ${res.status}`);
  }
  const data: ApiVideo = await res.json();
  const apiBase = base || (typeof window !== 'undefined' ? window.location.origin : '');
  return mapApiVideoToVideo(data, apiBase);
}

export async function updateVideoSubscribers(id: string, delta: number): Promise<Video | null> {
  const base = getApiBase();
  const url = base ? `${base}/api/videos/${id}/subscribe` : `/api/videos/${id}/subscribe`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta }),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to update subscribers: ${res.status}`);
  }
  const data: ApiVideo = await res.json();
  const apiBase = base || (typeof window !== 'undefined' ? window.location.origin : '');
  return mapApiVideoToVideo(data, apiBase);
}

/** Helper to get auth token from localStorage */
function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem('streamtube_user');
    if (stored) {
      const user = JSON.parse(stored);
      return user.token ?? null;
    }
  } catch { }
  return null;
}

/** Delete a video by ID (requires auth token). */
export async function deleteVideo(id: string): Promise<boolean> {
  const base = getApiBase();
  const url = base ? `${base}/api/videos/${id}` : `/api/videos/${id}`;
  const token = getAuthToken();
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to delete video: ${res.status}`);
  }
  return true;
}

/** Dashboard stats shape returned by the backend. */
export interface DashboardStats {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  videos: ApiVideo[];
}

/** Fetch dashboard stats for the logged-in user (requires auth token). */
export async function getDashboardStats(): Promise<{
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  videos: Video[];
}> {
  const base = getApiBase();
  const url = base ? `${base}/api/videos/dashboard` : `/api/videos/dashboard`;
  const token = getAuthToken();
  const res = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${res.status}`);
  }
  const data: DashboardStats = await res.json();
  const apiBase = base || (typeof window !== 'undefined' ? window.location.origin : '');
  return {
    totalVideos: data.totalVideos,
    totalViews: data.totalViews,
    totalLikes: data.totalLikes,
    videos: data.videos.map((v) => mapApiVideoToVideo(v, apiBase)),
  };
}
