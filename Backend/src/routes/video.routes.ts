import { Router } from "express";
import {
    uploadVideo,
    getAllVideos,
    getVideoById,
    incrementViews,
    updateReaction,
    updateSubscribers,
    getSubscriptionStatus,
    deleteVideo,
    getDashboardStats,
} from "../controllers/video.controller";
import { protect } from "../middleware/auth.middleware";
import { handleVideoUpload } from "../middleware/upload.middleware";

const router = Router();

router.get("/dashboard", protect, getDashboardStats); // Dashboard route
router.post("/upload", protect, handleVideoUpload, uploadVideo);
router.get("/", getAllVideos);
router.get("/:id", getVideoById);
router.post("/:id/view", protect, incrementViews); // Protect view increment to ensure unique user
router.post("/:id/react", protect, updateReaction);
router.post("/:id/subscribe", protect, updateSubscribers);
router.get("/:id/subscription-status", protect, getSubscriptionStatus);
router.delete("/:id", protect, deleteVideo); // Delete route

export default router;
