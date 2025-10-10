import {
  getAllQuizData,
  getCorrectOptionByQuestion,
  saveUserAnswerToHistory,
  getUserTotalPoints,
  getAllUsersTotalPoints,
  createQuestionWithAnswers,
  updateQuestionById,
  updateAnswersForQuestion,
  deleteQuestionById,
} from "../models/quizModel.js";
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
    if (!correctData)
      return res.status(404).json({ error: "Question introuvable" });

    const is_correct = parseInt(selected_option) === correctData.correct_option;
    const points_awarded = is_correct ? correctData.points_value || 1 : 0;

    await saveUserAnswerToHistory({
      user_id,
      sub_thematic_id: correctData.sub_thematic_id,
      score: points_awarded,
      max_score: correctData.points_value || 1,
      correct: is_correct,
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

    const formattedUsers = users.map((user) => ({
      ...user,
      total_points: Number(user.total_points) || 0,
      total_points_games: Number(user.total_points_games) || 0,
      total_points_achievements: Number(user.total_points_achievements) || 0,
      total_games_played: Number(user.total_games_played) || 0,
      total_achievements: Number(user.total_achievements) || 0,
      average_completion: user.average_completion
        ? Number(user.average_completion).toFixed(2)
        : "0.00",
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error) {
    console.error("❌ Erreur dans getAllUsersPoints:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message,
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
    const questions =
      await quizModel.getQuestionsBySubThematic(sub_thematic_id);
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

export const createQuestion = async (req, res) => {
  try {
    const allowed = ['facile', 'moyen', 'difficile'];
    const lvl = allowed.includes(req.body.difficulty_level) ? req.body.difficulty_level : 'moyen';

    const normalizeQuestionType = (t) => {
      const v = String(t || '').trim().toLowerCase();
      const map = {
        qcm: 'multiple_choice',
        'choix multiple': 'multiple_choice',
        'choix_unique': 'single_choice',
        'choix unique': 'single_choice',
        'vrai/faux': 'true_false',
        'vrai faux': 'true_false',
        vf: 'true_false',
        'texte libre': 'fill_in_blank',
        texte: 'fill_in_blank',
        multiple_choice: 'multiple_choice',
        single_choice: 'single_choice',
        true_false: 'true_false',
        fill_in_blank: 'fill_in_blank',
      };
      return map[v] || 'multiple_choice';
    };

    const payload = { 
      ...req.body, 
      difficulty_level: lvl,
      question_type: normalizeQuestionType(req.body.question_type),
    };

    const result = await createQuestionWithAnswers(payload);
    res.status(201).json({ message: "Question créée", question_id: result.question_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const allowed = ['facile', 'moyen', 'difficile'];
    const lvl = allowed.includes(req.body.difficulty_level) ? req.body.difficulty_level : 'moyen';

    const normalizeQuestionType = (t) => {
      const v = String(t || '').trim().toLowerCase();
      const map = {
        qcm: 'multiple_choice',
        'choix multiple': 'multiple_choice',
        'choix_unique': 'single_choice',
        'choix unique': 'single_choice',
        'vrai/faux': 'true_false',
        'vrai faux': 'true_false',
        vf: 'true_false',
        'texte libre': 'fill_in_blank',
        texte: 'fill_in_blank',
        multiple_choice: 'multiple_choice',
        single_choice: 'single_choice',
        true_false: 'true_false',
        fill_in_blank: 'fill_in_blank',
      };
      return map[v] || 'multiple_choice';
    };

    await updateQuestionById(req.params.question_id, { 
      ...req.body, 
      difficulty_level: lvl,
      question_type: normalizeQuestionType(req.body.question_type),
    });
    res.json({ message: "Question mise à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateQuestionAnswers = async (req, res) => {
  try {
    const normalizeAnswerType = (t) => {
      const v = String(t || '').trim().toLowerCase();
      const map = {
        texte: 'text',
        'texte libre': 'text',
        text: 'text',
        image: 'image',
        audio: 'audio',
        video: 'video',
        'vidéo': 'video',
      };
      return map[v] || 'text';
    };

    const payload = {
      ...req.body,
      answer_type: normalizeAnswerType(req.body.answer_type),
    };

    await updateAnswersForQuestion(req.params.question_id, payload);
    res.json({ message: "Réponses mises à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    await deleteQuestionById(req.params.question_id);
    res.json({ message: "Question supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------
// CRUD Sous-thématiques
// -----------------------------
export const getAllSubThematics = async (req, res) => {
  try {
    const { thematic_id } = req.query;
    if (thematic_id) {
      const subs = await quizModel.getSubThematicsByThematic(thematic_id);
      return res.json(subs);
    }
    const subs = await quizModel.getAllSubThematics();
    return res.json(subs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getSubThematicById = async (req, res) => {
  try {
    const sub = await quizModel.getSubThematicById(req.params.id);
    if (!sub) return res.status(404).json({ error: "Sous-thématique introuvable" });
    res.json(sub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createSubThematic = async (req, res) => {
  try {
    const {
      thematic_id,
      title,
      description = null,
      difficulty_level = 'moyen',
      display_order = 0,
      is_active = 1,
    } = req.body;

    if (!thematic_id || !title) {
      return res.status(400).json({ error: "thematic_id et title sont requis" });
    }

    const allowed = ['facile', 'moyen', 'difficile'];
    const lvl = allowed.includes(difficulty_level) ? difficulty_level : 'moyen';

    const insertId = await quizModel.createSubThematic({
      thematic_id,
      title,
      description,
      difficulty_level: lvl,
      display_order,
      is_active,
    });

    res.status(201).json({ message: "Sous-thématique créée", sub_thematic_id: insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateSubThematic = async (req, res) => {
  try {
    const {
      thematic_id,
      title,
      description = null,
      difficulty_level,
      display_order,
      is_active,
    } = req.body;

    const allowed = ['facile', 'moyen', 'difficile'];
    const lvl = allowed.includes(difficulty_level) ? difficulty_level : 'moyen';

    await quizModel.updateSubThematic(req.params.id, {
      thematic_id,
      title,
      description,
      difficulty_level: lvl,
      display_order,
      is_active,
    });

    res.json({ message: "Sous-thématique mise à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubThematic = async (req, res) => {
  try {
    await quizModel.deleteSubThematic(req.params.id);
    res.json({ message: "Sous-thématique supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createThematic = async (req, res) => {
  try {
    const { title, description, color_code, display_order } = req.body;
    const icon_url = req.file
      ? `/uploads/thematics/${req.file.filename}`
      : null;

    const insertId = await quizModel.createThematic({
      title,
      description,
      icon_url,
      color_code,
      display_order,
    });
    res
      .status(201)
      .json({ message: "Thématique créée", thematic_id: insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateThematic = async (req, res) => {
  try {
    const { title, description, color_code, display_order, is_active } =
      req.body;
    const icon_url = req.file
      ? `/uploads/thematics/${req.file.filename}`
      : undefined;

    await quizModel.updateThematic(req.params.id, {
      title,
      description,
      color_code,
      display_order,
      is_active,
      icon_url,
    });
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
    if (!thematic)
      return res.status(404).json({ error: "Thématique introuvable" });
    res.json(thematic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
