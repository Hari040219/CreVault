import { Request, Response } from "express";
import mongoose from "mongoose";
import Video from "../models/Video.model";
import View from "../models/View.model";
import Reaction from "../models/Reaction.model";
import Subscription from "../models/Subscription.model";
import User from "../models/User.model";

const getIO = (req: Request) => req.app.get("io");

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const videoUrl = (req as any).videoUrl;
    if (!videoUrl) {
      return res.status(400).json({ message: "No video uploaded" });
    }
    const thumbnailUrl = (req as any).thumbnailUrl || undefined;

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      user: (req as any).user.id,
    });

    res.status(201).json({ message: "Video uploaded successfully", video });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Video upload failed" });
  }
};

export const getAllVideos = async (_req: Request, res: Response) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 }).populate("user", "name email subscribers");
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id).populate("user", "name email subscribers");
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Add subscriber count to the response explicitly if needed, though populated user has it
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const incrementViews = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id; // Optional: tracked view if logged in
  const videoId = req.params.id;

  try {
    let video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // If user is logged in, check for unique view
    if (userId) {
      const existingView = await View.findOne({ user: userId, video: videoId });
      if (!existingView) {
        await View.create({ user: userId, video: videoId });
        video.views += 1;
        await video.save();
        getIO(req).to(`video_${videoId}`).emit("view_updated", { views: video.views });
      }
    } else {
      // Anonymous view (simple increment, or you could use IP/Session checks but keeping it simple)
      // For now, let's only count unique views for logged in users as requested "one view per user"
      // If anonymous views are allowed, uncomment below:
      // video.views += 1;
      // await video.save();
      // getIO(req).to(`video_${videoId}`).emit("view_updated", { views: video.views });
    }

    res.json(await video.populate("user", "name email subscribers"));
  } catch (error) {
    console.error("Increment views error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateReaction = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const videoId = req.params.id;
  const { type } = req.body; // 'like' or 'dislike'

  try {
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const existingReaction = await Reaction.findOne({ user: userId, video: videoId });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Toggle off
        await existingReaction.deleteOne();
        if (type === "like") video.likes = Math.max(0, video.likes - 1);
        else video.dislikes = Math.max(0, video.dislikes - 1); // Assuming dislikes field exists
      } else {
        // Switch reaction
        if (existingReaction.type === "like") {
          video.likes = Math.max(0, video.likes - 1);
          video.dislikes = (video.dislikes || 0) + 1;
        } else {
          video.dislikes = Math.max(0, (video.dislikes || 0) - 1);
          video.likes += 1;
        }
        existingReaction.type = type;
        await existingReaction.save();
      }
    } else {
      // New reaction
      await Reaction.create({ user: userId, video: videoId, type });
      if (type === "like") video.likes += 1;
      else video.dislikes = (video.dislikes || 0) + 1;
    }

    await video.save();
    getIO(req).to(`video_${videoId}`).emit("reaction_updated", { likes: video.likes, dislikes: video.dislikes });

    res.json(await video.populate("user", "name email subscribers"));
  } catch (error) {
    console.error("Update reaction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSubscribers = async (req: Request, res: Response) => {
  const subscriberId = (req as any).user.id;
  const videoId = req.params.id;

  try {
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const channelId = video.user;
    if (subscriberId === channelId.toString()) {
      return res.status(400).json({ message: "Cannot subscribe to yourself" });
    }

    const existingSub = await Subscription.findOne({ subscriber: subscriberId, channel: channelId });
    const channelUser = await User.findById(channelId);
    if (!channelUser) return res.status(404).json({ message: "Channel not found" });

    let isSubscribed = false;
    if (existingSub) {
      // Unsubscribe
      await existingSub.deleteOne();
      // user.subscribers is not in the User model by default in some setups, check schema
      // Assuming User model has 'subscribers' count field
      if (channelUser.subscribers > 0) channelUser.subscribers -= 1;
    } else {
      // Subscribe
      await Subscription.create({ subscriber: subscriberId, channel: channelId });
      channelUser.subscribers = (channelUser.subscribers || 0) + 1;
      isSubscribed = true;
    }

    await channelUser.save();

    // Emit to all clients viewing this user's videos? Or just the current video room?
    // Better to have a room for the channel/user, but video room works for immediate feedback
    getIO(req).to(`video_${videoId}`).emit("subscriber_updated", { subscribers: channelUser.subscribers });

    res.json({ subscribers: channelUser.subscribers, isSubscribed });
  } catch (error) {
    console.error("Update subscribers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const videoId = req.params.id;

  try {
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this video" });
    }

    await video.deleteOne();
    await View.deleteMany({ video: videoId });
    await Reaction.deleteMany({ video: videoId });
    // await Comment.deleteMany({ video: videoId }); // If comments exist

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const videos = await Video.find({ user: userId }).sort({ createdAt: -1 });

    const totalVideos = videos.length;
    const totalViews = videos.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalLikes = videos.reduce((acc, curr) => acc + (curr.likes || 0), 0);

    res.json({
      totalVideos,
      totalViews,
      totalLikes,
      videos,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const videoId = req.params.id;

  try {
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const channelId = video.user;
    const channelUser = await User.findById(channelId);
    if (!channelUser) return res.status(404).json({ message: "Channel not found" });

    const existingSub = await Subscription.findOne({ subscriber: userId, channel: channelId });

    res.json({
      subscribers: channelUser.subscribers || 0,
      isSubscribed: !!existingSub,
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
