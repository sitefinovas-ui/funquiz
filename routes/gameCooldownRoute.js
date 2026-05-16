import express from "express";
import { checkCooldown, activateCooldown } from "../controllers/gameCooldownController.js";
import { authenticateToken } from "../middleware/authentification.js";

const router = express.Router();

router.get("/game-cooldown",  authenticateToken, checkCooldown);
router.post("/game-cooldown", authenticateToken, activateCooldown);

export default router;
