import express from "express";
import { listAbout, aboutById, addAbout, editAbout, removeAbout } from "../controllers/aboutController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();
router.get("/legal/about", listAbout);
router.get("/legal/about/:id", aboutById);
router.post("/legal/about", authenticateToken, authorizeRole(["admin","moderator"]), addAbout);
router.put("/legal/about/:id", authenticateToken, authorizeRole(["admin","moderator"]), editAbout);
router.delete("/legal/about/:id", authenticateToken, authorizeRole(["admin"]), removeAbout);

export default router;