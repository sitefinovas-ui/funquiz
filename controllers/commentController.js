import {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentsWithUserAndQuiz,
} from "../models/commentModel.js";

export const allComments = async (req, res) => {
  try {
    const data = await getAllComments();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const commentById = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const data = await getCommentById(comment_id);
    if (data.length === 0) {
      return res.status(404).json({ error: "Commentaire non trouvé." });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { user_id, content, is_approved, is_visible } = req.body;
    if (!user_id || !content) {
      return res
        .status(400)
        .json({ error: "  Les champs user_id et content sont requis." });
    }
    const newComment = await createComment({
      user_id,
      content,
      is_approved,
      is_visible,
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const editComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { user_id, content, is_approved, is_visible } = req.body;

    if (!user_id && !content && is_approved === undefined && is_visible === undefined) {
      return res.status(400).json({
        error: "Au moins un champ (user_id, content, is_approved, is_visible) doit être fourni pour la mise à jour.",
      });
    }

    const updatedComment = await updateComment(comment_id, {
      user_id,
      content,
      is_approved,
      is_visible,
    });
    res.status(200).json(updatedComment);
  } catch (error) {
    if (error.message === "Commentaire non trouvé.") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const removeComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    await deleteComment(comment_id);
    res.json({ message: "Commentaire supprimé avec succès." });
  } catch (error) {
    if (error.message === "Commentaire non trouvé.") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const commentsWithUserAndQuiz = async (req, res) => {
  try {
    const data = await getCommentsWithUserAndQuiz();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
