import express from "express";
import { listImages, uploadImage, deleteImage } from "../controllers/storageController.js";
import { authenticateToken } from "../middleware/authentification.js";
import upload from "../config/multer.js";

const router = express.Router();

router.get("/storage",           authenticateToken, listImages);
router.post("/storage/upload",   authenticateToken, upload.single("image"), uploadImage);
router.delete("/storage/:filename", authenticateToken, deleteImage);

export default router;
