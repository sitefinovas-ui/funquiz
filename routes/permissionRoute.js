import express from "express";
import { listRolePermissions, saveRolePermissions } from "../controllers/permissionController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();

// Seul l'admin peut voir et modifier les permissions des rôles
router.get("/", authenticateToken, authorizeRole(["admin"]), listRolePermissions);
router.put("/update", authenticateToken, authorizeRole(["admin"]), saveRolePermissions);

export default router;
