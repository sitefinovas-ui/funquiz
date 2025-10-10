import {
  createQuizSession,
  getQuizSessionById,
  updateQuizSessionProgress,
  completeQuizSession,
  getUserQuizSessions,
} from "../models/quizUserSessionModel.js";

export const createSession = async (req, res) => {
  try {
    const sessionId = await createQuizSession(req.body);
    res
      .status(201)
      .json({ message: "Session créée avec succès ✅", sessionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await getQuizSessionById(req.params.sessionId);
    if (!session)
      return res.status(404).json({ message: "Session non trouvée ❌" });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSession = async (req, res) => {
  try {
    await updateQuizSessionProgress(req.params.sessionId, req.body);
    res.json({ message: "Progression mise à jour avec succès ✅" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const finishSession = async (req, res) => {
  try {
    await completeQuizSession(req.params.sessionId);
    res.json({ message: "Session terminée 🏁" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSessionsByUser = async (req, res) => {
  try {
    const sessions = await getUserQuizSessions(req.params.userId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
