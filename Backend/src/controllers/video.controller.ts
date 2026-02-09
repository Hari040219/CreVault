import { Request, Response } from "express";
import Video from "../models/Video.model";

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    const video = await Video.create({
      title,
      description,
      videoUrl: req.file.path,
      user: (req as any).user.id,
    });

    res.status(201).json({
      message: "Video uploaded",
      video,
    });
  } catch (error) {
    res.status(500).json({ message: "Video upload failed" });
  }
};

export const getAllVideos = async (_req: Request, res: Response) => {
  const videos = await Video.find().populate("user", "name email");
  res.json(videos);
};
