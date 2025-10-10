import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";
import {
  getAllQuizStats,
  getGlobalStats,
  getStatsByThematic,
  getRecentActivityStats,
  getUserRankingsStats,
  getDifficultyStatistics
} from "../controllers/quizStatsController.js";

const router = express.Router();

// Route protégée pour toutes les statistiques
router.get(
  "/stats",
  getAllQuizStats
);

// Route protégée pour les stats globales
router.get(
  "/stats/global",
  getGlobalStats
);

// Route protégée pour les stats par thématique
router.get(
  "/stats/thematics",
  getStatsByThematic
);

// Route protégée pour l'activité récente
router.get(
  "/stats/activity",
  getRecentActivityStats
);

// Route protégée pour le classement
router.get(
  "/stats/rankings",
  getUserRankingsStats
);

// Route protégée pour les stats par difficulté
router.get(
  "/stats/difficulty",
  getDifficultyStatistics
);

export default router;