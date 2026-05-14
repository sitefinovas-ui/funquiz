import express from "express";
import { listAbout, aboutById, addAbout, editAbout, removeAbout } from "../controllers/aboutController.js";
import { authenticateToken, authorizeRole, hasPermission } from "../middleware/authentification.js";

const router = express.Router();
router.get("/", listAbout);
router.get("/:id", aboutById);
router.post("/", authenticateToken, hasPermission("about_edit"), addAbout);
router.put("/:id", authenticateToken, hasPermission("about_edit"), editAbout);
router.delete("/:id", authenticateToken, hasPermission("about_edit"), removeAbout);

export default router;