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
} from "../middleware/authentification.js";

const router = express.Router();

// Comment routes
router.get("/comments", allComments); // Récupérer tous les commentaires
router.get("/comments/:comment_id", commentById); // Récupérer un commentaire par ID
router.post("/comments", authenticateToken, addComment); // Ajouter un nouveau commentaire (utilisateur authentifié)
router.put("/comments/:comment_id", authenticateToken, editComment); // Mettre à jour un commentaire (utilisateur authentifié)
router.delete("/comments/:comment_id", authenticateToken, removeComment); // Supprimer un commentaire (utilisateur authentifié)
router.get("/comments-with-details", commentsWithUserAndQuiz); // Récupérer les commentaires avec détails (admin/modérateur uniquement)

export default router;
