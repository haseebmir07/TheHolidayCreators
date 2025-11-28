// server/utils/uploadHelpers.js
import multer from "multer";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Configure cloudinary (make sure env vars set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ensure tmp dir exists for disk storage
const uploadDir = path.join(process.cwd(), "tmp_uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Disk storage (default)
export const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

// You can switch to memoryStorage if you prefer (comment/uncomment)
export const multerMemoryStorage = multer.memoryStorage();

// Default: use disk storage to simplify path handling
export const upload = multer({ storage: multer.memoryStorage() });
// If you prefer memory-based (no temp files), use:
// export const upload = multer({ storage: multerMemoryStorage });

// Helper: upload a file object to Cloudinary. Accepts either:
// - file.path (a disk path), or
// - file.buffer (Buffer) produced by memoryStorage
export const uploadFileToCloudinary = async (file, folder = "rooms") => {
  if (!file) throw new Error("uploadFileToCloudinary: file is required");

  // If file.path exists (disk storage), use upload() directly
  if (file.path) {
    try {
      const result = await cloudinary.uploader.upload(file.path, { folder });
      // remove temp file
      fs.unlink(file.path, (err) => {
        if (err) console.warn("tmp file unlink error", err);
      });
      return result.secure_url;
    } catch (err) {
      // ensure temp file removed if error
      try { fs.unlinkSync(file.path); } catch (e) {}
      throw err;
    }
  }

  // Otherwise, if memory buffer present, upload via upload_stream
  if (file.buffer) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  throw new Error("uploadFileToCloudinary: file must have path or buffer");
};
