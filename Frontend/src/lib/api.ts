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
  createdAt?: string;
  // The backend populates user as an object with { _id, name, email, subscribers }
  user?: {
    _id: string;
    name: string;
    email?: string;
    subscribers?: number;
  } | string; // Could be just an ObjectId string if not populated
}

/** Base URL for API. In dev with Vite proxy use '' so /api goes to backend. */
export function getApiBase(): string {
  return import.meta.env.VITE_API_URL ?? '';
}

/** Map backend video to frontend Video type. */
export function mapApiVideoToVideo(api: ApiVideo, baseUrl: string = getApiBase()): Video {
  // Handle populated user object vs plain ObjectId string
  let authorId = api._id;
  let authorName = 'Unknown';
  let authorEmail = '';
  let authorSubscribers = 0;

  if (api.user && typeof api.user === 'object') {
    authorId = api.user._id;
    authorName = api.user.name || 'Unknown';
    authorEmail = api.user.email || '';
    authorSubscribers = api.user.subscribers ?? 0;
  } else if (typeof api.user === 'string') {
    authorId = api.user;
  }

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
      email: authorEmail,
      avatar: '',
      role: 'user',
      createdAt: '',
      subscribers: authorSubscribers,
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
  const token = getAuthToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
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
  type: 'like' | 'dislike'
): Promise<Video | null> {
  const base = getApiBase();
  const url = base ? `${base}/api/videos/${id}/react` : `/api/videos/${id}/react`;
  const token = getAuthToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ type }),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to update reaction: ${res.status}`);
  }
  const data: ApiVideo = await res.json();
  const apiBase = base || (typeof window !== 'undefined' ? window.location.origin : '');
  return mapApiVideoToVideo(data, apiBase);
}

/** Response shape from the subscribe endpoint */
export interface SubscribeResponse {
  subscribers: number;
  isSubscribed: boolean;
}

export async function updateVideoSubscribers(id: string): Promise<SubscribeResponse | null> {
  const base = getApiBase();
  const url = base ? `${base}/api/videos/${id}/subscribe` : `/api/videos/${id}/subscribe`;
  const token = getAuthToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to update subscribers: ${res.status}`);
  }
  return await res.json();
}

/** Check if current user is subscribed to the channel that owns a video. */
export async function checkSubscriptionStatus(videoId: string): Promise<SubscribeResponse | null> {
  const base = getApiBase();
  const url = base ? `${base}/api/videos/${videoId}/subscription-status` : `/api/videos/${videoId}/subscription-status`;
  const token = getAuthToken();
  if (!token) return null;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  return await res.json();
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

/** User profile shape from the backend. */
export interface ApiUserProfile {
  id: string;
  name: string;
  email: string;
  subscribers: number;
  createdAt: string;
}

/** Fetch a user's public profile by their ID. */
export async function getUserProfile(userId: string): Promise<ApiUserProfile | null> {
  const base = getApiBase();
  const url = base ? `${base}/api/users/${userId}` : `/api/users/${userId}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch user profile: ${res.status}`);
  }
  return await res.json();
}

/** Fetch all videos uploaded by a specific user. */
export async function getUserVideos(userId: string): Promise<Video[]> {
  const base = getApiBase();
  const url = base ? `${base}/api/users/${userId}/videos` : `/api/users/${userId}/videos`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch user videos: ${res.status}`);
  }
  const data: ApiVideo[] = await res.json();
  const apiBase = base || (typeof window !== 'undefined' ? window.location.origin : '');
  return data.map((v) => mapApiVideoToVideo(v, apiBase));
}
