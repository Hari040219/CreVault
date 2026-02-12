import multer from "multer";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import { Readable } from "stream";

/**
 * Use memory storage so multer buffers both files.
 * We upload each one to Cloudinary ourselves with the correct resource_type.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

/**
 * Helper: upload a buffer to Cloudinary via stream.
 */
function uploadToCloudinary(
  buffer: Buffer,
  options: Record<string, any>
): Promise<any> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

/**
 * Middleware: accept "video" + optional "thumbnail", upload both to Cloudinary,
 * then put the URLs on the request for the controller.
 */
export function handleVideoUpload(req: Request, res: Response, next: NextFunction) {
  const multiUpload = upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]);

  multiUpload(req, res, async (err: any) => {
    if (err) {
      console.error("Multer upload error:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File too large. Max 100 MB." });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ message: err.message || "Upload failed" });
    }

    const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
    const videoFile = files?.video?.[0];

    if (!videoFile) {
      return res.status(400).json({ message: "No video file provided" });
    }

    try {
      // Upload video to Cloudinary
      const videoResult = await uploadToCloudinary(videoFile.buffer, {
        folder: "videos",
        resource_type: "video",
      });
      // Put the Cloudinary URL on req so the controller can read it
      (req as any).videoUrl = videoResult.secure_url;

      // Upload thumbnail if present
      const thumbFile = files?.thumbnail?.[0];
      if (thumbFile) {
        const thumbResult = await uploadToCloudinary(thumbFile.buffer, {
          folder: "thumbnails",
          resource_type: "image",
        });
        (req as any).thumbnailUrl = thumbResult.secure_url;
      }

      next();
    } catch (uploadErr: any) {
      console.error("Cloudinary upload error:", uploadErr);
      return res.status(500).json({
        message: uploadErr.message || "Failed to upload to cloud storage",
      });
    }
  });
}

export default upload;
