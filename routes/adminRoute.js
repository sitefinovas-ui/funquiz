import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";
import { clearBackendCache, getBackendCacheStats } from "../controllers/adminController.js";
import { getWhatsAppQrForAdmin } from "../controllers/whatsappAdminController.js";

const router = express.Router();

router.get("/admin/cache", authenticateToken, authorizeRole(["admin"]), getBackendCacheStats);
router.post(
  "/admin/clear-cache",
  authenticateToken,
  authorizeRole(["admin"]),
  clearBackendCache
);

router.get(
  "/admin/whatsapp/qr",
  authenticateToken,
  authorizeRole(["admin"]),
  getWhatsAppQrForAdmin
);

export default router;
