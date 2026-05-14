import express from "express";
import {
  allComments,
  commentById,
  addComment,
  editComment,
  removeComment,
  commentsWithUserAndQuiz,
} from "../controllers/commentController.js";
import {
  authenticateToken,
  authorizeRole,
  hasPermission,
} from "../middleware/authentification.js";

const router = express.Router();

// Comment routes
router.get("/comments", allComments); // Récupérer tous les commentaires
router.get("/comments/:comment_id", commentById); // Récupérer un commentaire par ID
router.post("/comments", authenticateToken, addComment); // Ajouter un nouveau commentaire (utilisateur authentifié)
router.put("/comments/:comment_id", authenticateToken, hasPermission("comments_approve"), editComment); // Mettre à jour un commentaire (moderation)
router.delete("/comments/:comment_id", authenticateToken, hasPermission("comments_delete"), removeComment); // Supprimer un commentaire
router.get("/comments-with-details", authenticateToken, hasPermission("comments_view"), commentsWithUserAndQuiz); // Récupérer les commentaires avec détails

export default router;
