import express from "express";
import { listModeratorActions } from "../controllers/moderatorActionController.js";
import { authenticateToken, authorizeRole, hasPermission } from "../middleware/authentification.js";

const router = express.Router();

// Seul l'admin ou les modérateurs autorisés peuvent voir l'historique des actions
router.get("/", authenticateToken, hasPermission("logs_view"), listModeratorActions);

export default router;
