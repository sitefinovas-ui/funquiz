import express from 'express';
import {
  allFaqData,
  faqById,
  addFaq,
  editFaq,
  removeFaq
} from '../controllers/faqController.js';
import { authenticateToken, authorizeRole } from '../middleware/authentification.js';

const router = express.Router();

// FAQ routes
router.get('/faq', allFaqData); // Récupérer toutes les FAQs
router.get('/faq/:faq_id', faqById); // Récupérer une FAQ par ID
router.post('/faq', authenticateToken, authorizeRole(['admin', 'moderator']), addFaq); // Ajouter une nouvelle FAQ (admin uniquement)
router.put('/faq/:faq_id', authenticateToken, authorizeRole(['admin']), editFaq); // Mettre à jour une FAQ (admin uniquement)
router.delete('/faq/:faq_id', authenticateToken, authorizeRole(['admin']), removeFaq); // Supprimer une FAQ (admin uniquement)

export default router;