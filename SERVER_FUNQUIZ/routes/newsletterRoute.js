import express from "express";
import {
  allNewsletters,
  newsletterById,
  addNewsletter,
  removeNewsletter,
  sendNewsletterBulk,
  searchNewsletterWithFilters,
  updateConfirmedStatus,
} from "../controllers/newsletterController.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middleware/authentification.js";
import cors from "cors";

const router = express.Router();

// Routes publiques
// Préflight CORS pour l’inscription newsletter
router.options("/newsletters", cors());
// Inscription newsletter (publique) avec CORS route-spécifique
router.post("/newsletters", cors({ origin: true, credentials: false }), addNewsletter);

// Routes protégées (admin/modérateur)
router.get("/newsletters", authenticateToken, authorizeRole(["admin", "moderator"]), allNewsletters);
router.get("/newsletters/search", authenticateToken, authorizeRole(["admin", "moderator"]), searchNewsletterWithFilters);
router.get("/newsletters/:id", authenticateToken, authorizeRole(["admin", "moderator"]), newsletterById);
router.put(
  "/newsletters/:id/status",
  authenticateToken,
  authorizeRole(["admin"]),
  updateConfirmedStatus
);
router.delete(
  "/newsletters/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  removeNewsletter
);
router.post(
  "/newsletters/send",
  authenticateToken,
  authorizeRole(["admin", "moderator"]),
  sendNewsletterBulk
);

export default router;
