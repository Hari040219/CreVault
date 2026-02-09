import { Router } from "express";
import { uploadVideo, getAllVideos } from "../controllers/video.controller";
import { protect } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";

const router = Router();

router.post("/upload", protect, upload.single("video"), uploadVideo);
router.get("/", getAllVideos);

export default router;
