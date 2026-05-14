import express from "express";
import { listPrivacy, privacyById, addPrivacy, editPrivacy, removePrivacy } from "../controllers/privacyPolicyController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();
router.get("/", listPrivacy);
router.get("/:id", privacyById);
router.post("/", authenticateToken, authorizeRole(["admin","moderator"]), addPrivacy);
router.put("/:id", authenticateToken, authorizeRole(["admin","moderator"]), editPrivacy);
router.delete("/:id", authenticateToken, authorizeRole(["admin"]), removePrivacy);

export default router;