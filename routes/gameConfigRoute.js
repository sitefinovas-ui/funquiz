import express from "express";
import {
  listConfig,
  getConfig,
  putConfig,
  postConfig,
  removeConfig,
} from "../controllers/gameConfigController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();

// Public read (game clients need this without a token)
router.get("/game-config",         listConfig);
router.get("/game-config/:key",    getConfig);

// Admin write
router.post("/game-config",        authenticateToken, authorizeRole(["admin"]), postConfig);
router.put("/game-config/:key",    authenticateToken, authorizeRole(["admin"]), putConfig);
router.delete("/game-config/:key", authenticateToken, authorizeRole(["admin"]), removeConfig);

export default router;
