import express from "express";
import { listPrivacy, privacyById, addPrivacy, editPrivacy, removePrivacy } from "../controllers/privacyPolicyController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();
router.get("/legal/privacy", listPrivacy);
router.get("/legal/privacy/:id", privacyById);
router.post("/legal/privacy", authenticateToken, authorizeRole(["admin","moderator"]), addPrivacy);
router.put("/legal/privacy/:id", authenticateToken, authorizeRole(["admin","moderator"]), editPrivacy);
router.delete("/legal/privacy/:id", authenticateToken, authorizeRole(["admin"]), removePrivacy);

export default router;