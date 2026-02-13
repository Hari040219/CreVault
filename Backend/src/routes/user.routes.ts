import { Router } from "express";
import { getUserProfile, getUserVideos } from "../controllers/user.controller";

const router = Router();

router.get("/:id", getUserProfile);
router.get("/:id/videos", getUserVideos);

export default router;
