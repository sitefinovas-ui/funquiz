import express from "express";
import {
  createSession,
  getSession,
  updateSession,
  finishSession,
  getSessionsByUser,
} from "../controllers/quizUserSessionController.js";

const router = express.Router();

router.post("/session/", createSession); // ➕ Créer une session
router.get("/session/:sessionId", getSession); // 🔍 Obtenir une session
router.put("/session/:sessionId", updateSession); // ♻️ Mettre à jour la progression
router.put("/session/:sessionId/complete", finishSession); // 🏁 Terminer la session
router.get("/session/user/:userId", getSessionsByUser); // 👤 Liste des sessions d’un utilisateur

export default router;
