import { Request, Response } from "express";
import User from "../models/User.model";
import Video from "../models/Video.model";

/**
 * GET USER PROFILE BY ID (public)
 */
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            subscribers: user.subscribers || 0,
            createdAt: (user as any).createdAt,
        });
    } catch (error) {
        console.error("Get user profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET VIDEOS BY USER ID (public)
 */
export const getUserVideos = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const videos = await Video.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate("user", "name email subscribers");

        res.json(videos);
    } catch (error) {
        console.error("Get user videos error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
