import { getAllQuizData, getCorrectOptionByQuestion, saveUserAnswerToHistory, getUserTotalPoints, getAllUsersTotalPoints } from "../models/quizModel.js";
import quizModel from "../models/quizModel.js";

// Récupérer tout le quiz
export const allQuizData = async (req, res) => {
  try {
    const data = await getAllQuizData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validateAnswer = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { question_id, selected_option } = req.body;

    const correctData = await getCorrectOptionByQuestion(question_id);
    if (!correctData) return res.status(404).json({ error: "Question introuvable" });

    const is_correct = parseInt(selected_option) === correctData.correct_option;
    const points_awarded = is_correct ? (correctData.points_value || 1) : 0;

    await saveUserAnswerToHistory({
      user_id,
      sub_thematic_id: correctData.sub_thematic_id,
      score: points_awarded,
      max_score: correctData.points_value || 1,
      correct: is_correct
    });

    res.json({ question_id, is_correct, points_awarded });
  } catch (error) {
    console.error("Erreur validateAnswer:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserPoints = async (req, res) => {
  try {
    const { user_id } = req.params;
    const data = await getUserTotalPoints(user_id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsersPoints = async (req, res) => {
  try {
    const users = await getAllUsersTotalPoints();
    
    const formattedUsers = users.map(user => ({
      ...user,
      total_points: Number(user.total_points) || 0,
      total_points_games: Number(user.total_points_games) || 0, 
      total_points_achievements: Number(user.total_points_achievements) || 0,
      total_games_played: Number(user.total_games_played) || 0,
      total_achievements: Number(user.total_achievements) || 0,
      average_completion: user.average_completion ? Number(user.average_completion).toFixed(2) : '0.00'
    }));
    
    res.status(200).json({
      success: true,
      data: formattedUsers,
      total: formattedUsers.length
    });
    
  } catch (error) {
    console.error('❌ Erreur dans getAllUsersPoints:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message 
    });
  }
};

export const getSubThematics = async (req, res) => {
  try {
    const { thematic_id } = req.params;
    const subThematics = await quizModel.getSubThematicsByThematic(thematic_id);
    res.json(subThematics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const { sub_thematic_id } = req.params;
    const questions = await quizModel.getQuestionsBySubThematic(sub_thematic_id);
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getAnswers = async (req, res) => {
  try {
    const { question_id } = req.params;
    const answers = await quizModel.getAnswersByQuestion(question_id);
    res.json(answers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createThematic = async (req, res) => {
  try {
    const { title, description, color_code, display_order } = req.body;
    const icon_url = req.file ? `/uploads/thematics/${req.file.filename}` : null;

    const insertId = await quizModel.createThematic({ title, description, icon_url, color_code, display_order });
    res.status(201).json({ message: "Thématique créée", thematic_id: insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateThematic = async (req, res) => {
  try {
    const { title, description, color_code, display_order, is_active } = req.body;
    const icon_url = req.file ? `/uploads/thematics/${req.file.filename}` : undefined;

    await quizModel.updateThematic(req.params.id, { title, description, color_code, display_order, is_active, icon_url });
    res.json({ message: "Thématique mise à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteThematic = async (req, res) => {
  try {
    await quizModel.deleteThematic(req.params.id);
    res.json({ message: "Thématique supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllThematics = async (req, res) => {
  try {
    const thematics = await quizModel.getAllThematics();
    res.json(thematics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getThematicById = async (req, res) => {
  try {
    const thematic = await quizModel.getThematicById(req.params.id);
    if (!thematic) return res.status(404).json({ error: "Thématique introuvable" });
    res.json(thematic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};