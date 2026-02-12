import { Request, Response } from "express";
import Video from "../models/Video.model";

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    const videoUrl = (req as any).videoUrl;
    if (!videoUrl) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    const thumbnailUrl = (req as any).thumbnailUrl || undefined;

    console.log("Saving video:", { title, videoUrl, thumbnailUrl, user: (req as any).user.id });

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      user: (req as any).user.id,
    });

    console.log("Video uploaded successfully:", video._id);

    res.status(201).json({
      message: "Video uploaded successfully",
      video,
    });
  } catch (error) {
    console.error("Video upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Video upload failed";
    res.status(500).json({ message: errorMessage });
  }
};

export const getAllVideos = async (_req: Request, res: Response) => {
  const videos = await Video.find().populate("user", "name email");
  res.json(videos);
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id).populate("user", "name email");
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Get video error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const incrementViews = async (req: Request, res: Response) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("user", "name email");
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Increment views error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateReaction = async (req: Request, res: Response) => {
  try {
    const { type, delta } = req.body;
    const update = type === "like" ? { $inc: { likes: delta } } : { $inc: { dislikes: delta } };
    const video = await Video.findByIdAndUpdate(req.params.id, update, { new: true }).populate("user", "name email");
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Update reaction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSubscribers = async (req: Request, res: Response) => {
  try {
    const { delta } = req.body;
    const video = await Video.findById(req.params.id).populate("user", "name email");
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    // Return the video as-is (subscriber count is on the user, not the video)
    res.json(video);
  } catch (error) {
    console.error("Update subscribers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

