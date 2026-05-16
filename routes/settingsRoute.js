import express from "express";
import {
  listSettings,
  saveSettings,
  getMaintenanceStatus,
  setMaintenanceMode,
} from "../controllers/settingsController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();

// Public — appelé par le frontend avant tout chargement
router.get("/maintenance", getMaintenanceStatus);

// Admin uniquement
router.post("/maintenance", authenticateToken, authorizeRole(["admin"]), setMaintenanceMode);
router.get("/",  authenticateToken, authorizeRole(["admin"]), listSettings);
router.post("/", authenticateToken, authorizeRole(["admin"]), saveSettings);

export default router;
