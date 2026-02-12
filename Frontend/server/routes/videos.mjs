import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Video from '../models/Video.mjs';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadsRoot = path.join(__dirname, '..', 'uploads');
const videosDir = path.join(uploadsRoot, 'videos');
const thumbsDir = path.join(uploadsRoot, 'thumbnails');

for (const dir of [uploadsRoot, videosDir, thumbsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, videosDir);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, thumbsDir);
    } else {
      cb(null, uploadsRoot);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// POST /api/videos - upload new video
router.post(
  '/',
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, category, duration, authorId, authorName, authorAvatar } = req.body;
      const videoFile = req.files?.video?.[0];
      const thumbnailFile = req.files?.thumbnail?.[0];

      if (!videoFile) {
        return res.status(400).json({ message: 'Video file is required' });
      }

      const videoUrl = `/uploads/videos/${videoFile.filename}`;
      const thumbnailUrl = thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : '';

      const video = await Video.create({
        title,
        description,
        category,
        duration: duration || '',
        videoUrl,
        thumbnailUrl,
        authorId,
        authorName,
        authorAvatar,
      });

      return res.status(201).json(video);
    } catch (err) {
      console.error('Error uploading video:', err);
      return res.status(500).json({ message: 'Failed to upload video' });
    }
  }
);

// GET /api/videos - list videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});

// GET /api/videos/:id - single video
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (err) {
    console.error('Error fetching video:', err);
    res.status(500).json({ message: 'Failed to fetch video' });
  }
});

// POST /api/videos/:id/view - increment view count
router.post('/:id/view', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (err) {
    console.error('Error incrementing views:', err);
    res.status(500).json({ message: 'Failed to increment views' });
  }
});

// POST /api/videos/:id/react - update likes/dislikes
router.post('/:id/react', async (req, res) => {
  try {
    const { type, delta } = req.body ?? {};

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    const incValue = Number(delta) || 0;
    if (!incValue) {
      return res.status(400).json({ message: 'Invalid delta' });
    }

    const field = type === 'like' ? 'likes' : 'dislikes';
    const update = { $inc: { [field]: incValue } };

    const video = await Video.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (err) {
    console.error('Error updating reaction:', err);
    res.status(500).json({ message: 'Failed to update reaction' });
  }
});

// POST /api/videos/:id/subscribe - update author subscriber count
router.post('/:id/subscribe', async (req, res) => {
  try {
    const { delta } = req.body ?? {};
    const incValue = Number(delta) || 0;
    if (!incValue) {
      return res.status(400).json({ message: 'Invalid delta' });
    }

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { authorSubscribers: incValue } },
      { new: true }
    );
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (err) {
    console.error('Error updating subscribers:', err);
    res.status(500).json({ message: 'Failed to update subscribers' });
  }
});

export default router;

