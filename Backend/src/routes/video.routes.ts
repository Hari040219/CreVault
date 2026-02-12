import { Router } from "express";
import {
    uploadVideo,
    getAllVideos,
    getVideoById,
    incrementViews,
    updateReaction,
    updateSubscribers,
} from "../controllers/video.controller";
import { protect } from "../middleware/auth.middleware";
import { handleVideoUpload } from "../middleware/upload.middleware";

const router = Router();

router.post("/upload", protect, handleVideoUpload, uploadVideo);
router.get("/", getAllVideos);
router.get("/:id", getVideoById);
router.post("/:id/view", incrementViews);
router.post("/:id/react", updateReaction);
router.post("/:id/subscribe", updateSubscribers);

export default router;
