import express from "express";
import {
  allFaqData,
  faqById,
  addFaq,
  editFaq,
  removeFaq,
} from "../controllers/faqController.js";
import {
  authenticateToken,
  authorizeRole,
  hasPermission,
} from "../middleware/authentification.js";

const router = express.Router();

// FAQ routes
router.get("/faq", allFaqData); // Récupérer toutes les FAQs
router.get("/faq/:faq_id", faqById); // Récupérer une FAQ par ID
router.post(
  "/faq",
  authenticateToken,
  hasPermission("about_edit"),
  addFaq,
); // Ajouter une nouvelle FAQ
router.put(
  "/faq/:faq_id",
  authenticateToken,
  hasPermission("about_edit"),
  editFaq,
); // Mettre à jour une FAQ
router.delete(
  "/faq/:faq_id",
  authenticateToken,
  hasPermission("about_edit"),
  removeFaq,
); // Supprimer une FAQ

export default router;
