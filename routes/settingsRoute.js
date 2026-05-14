import express from "express";
import { listSettings, saveSettings } from "../controllers/settingsController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();

router.get("/", authenticateToken, authorizeRole(["admin"]), listSettings);
router.post("/", authenticateToken, authorizeRole(["admin"]), saveSettings);

export default router;
