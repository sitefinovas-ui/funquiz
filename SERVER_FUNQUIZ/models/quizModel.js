import db from "../config/db.js";

// =============================================================================
// FONCTIONS QUIZ - DONNÉES COMPLÈTES
// =============================================================================

export const getAllQuizData = async () => {
  const sql = `
   SELECT 
    t.thematic_id,
    t.title AS thematic_title,
    t.description AS thematic_description,
    t.icon_url,
    t.color_code,
    t.is_active AS view,
    t.updated_at AS date_of_creation,

    JSON_ARRAYAGG(
        JSON_OBJECT(
            'sub_thematic_id', st.sub_thematic_id,
            'title', st.title,
            'description', st.description,
            'difficulty_level', st.difficulty_level,
            'questions', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'question_id', q.question_id,
                        'content', q.content,
                        'explanation', q.explanation,
                        'diff_question', q.difficulty_level,
                        'question_type', q.question_type,
                        'points', q.points,
                        'time_limit', q.time_limit,
                        'answers', (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'answer_id', a.answer_id,
                                    'answer_option1', a.answer_option1,
                                    'answer_option2', a.answer_option2,
                                    'answer_option3', a.answer_option3,
                                    'correct_option', a.correct_option,
                                    'media_url', a.media_url,
                                    'points_value', a.points_value
                                )
                            )
                            FROM quiz_answers a
                            WHERE a.question_id = q.question_id
                        )
                    )
                )
                FROM quiz_questions q
                WHERE q.sub_thematic_id = st.sub_thematic_id
            )
        )
    ) AS sub_thematics

FROM quiz_thematics t
LEFT JOIN quiz_sub_thematics st ON st.thematic_id = t.thematic_id
WHERE t.is_active = TRUE
GROUP BY t.thematic_id;
  `;

  const [rows] = await db.query(sql);
  return rows;
};

// =============================================================================
// FONCTIONS VALIDATION & SCORING
// =============================================================================

export const getCorrectOptionByQuestion = async (question_id) => {
  const [rows] = await db.query(
    `SELECT q.sub_thematic_id, a.correct_option, a.points_value
     FROM quiz_answers a
     JOIN quiz_questions q ON a.question_id = q.question_id
     WHERE a.question_id = ? 
     LIMIT 1`,
    [question_id]
  );
  return rows[0] || null;
};

export const saveUserAnswerToHistory = async ({ user_id, sub_thematic_id, score, max_score, correct }) => {
  const [result] = await db.query(
    `INSERT INTO quiz_game_history 
     (user_id, sub_thematic_id, score, max_score, total_questions, correct_answers)
     VALUES (?, ?, ?, ?, 1, ?)`,
    [user_id, sub_thematic_id, score, max_score, correct ? 1 : 0]
  );
  return result;
};

// =============================================================================
// FONCTIONS POINTS & STATISTIQUES
// =============================================================================

export const getUserTotalPoints = async (user_id) => {
  const [rows] = await db.query(
    `SELECT 
        u.user_id,
        CONCAT(u.first_name, ' ', u.name) AS full_name,
        COALESCE(SUM(gh.score), 0) AS total_points,
        COUNT(DISTINCT gh.history_id) AS total_games_played
     FROM funquiz_users u
     LEFT JOIN quiz_game_history gh ON u.user_id = gh.user_id
     WHERE u.user_id = ?
     GROUP BY u.user_id`,
    [user_id]
  );

  return rows[0] || { user_id, full_name: "", total_points: 0, total_games_played: 0 };
};

export const getAllUsersTotalPoints = async () => {
  const [rows] = await db.query(`
    SELECT 
      up.user_id,
      fu.avatar_url,
      up.name,
      up.first_name,
      up.full_name,
      up.email,
      up.total_points_games,
      up.total_points_achievements,
      up.total_points,
      up.total_games_played,
      up.total_achievements,
      up.average_completion
    FROM user_points up
    JOIN funquiz_users fu ON fu.user_id = up.user_id
    ORDER BY up.total_points DESC, up.total_points_games DESC, up.name ASC  
  `);
  
  return rows;
};


// =============================================================================
// MODÈLE QUIZ PRINCIPAL
// =============================================================================

const quizModel = {
  
  // Sous-thématiques
  getSubThematicsByThematic: async (thematic_id) => {
    const [rows] = await db.query(`
      SELECT * 
      FROM quiz_sub_thematics 
      WHERE thematic_id = ? AND is_active = TRUE
      ORDER BY display_order
    `, [thematic_id]);
    return rows;
  },

  // Questions
  getQuestionsBySubThematic: async (sub_thematic_id) => {
    const [rows] = await db.query(`
      SELECT q.question_id, q.content, q.question_type, q.points, q.time_limit
      FROM quiz_questions q
      WHERE q.sub_thematic_id = ? AND q.is_active = TRUE
      ORDER BY q.question_id
    `, [sub_thematic_id]);
    return rows;
  },

  // Réponses
  getAnswersByQuestion: async (question_id) => {
    const [rows] = await db.query(`
      SELECT answer_id, answer_option1, answer_option2, answer_option3, answer_type, media_url, correct_option
      FROM quiz_answers
      WHERE question_id = ?
      ORDER BY points_value
    `, [question_id]);
    return rows;
  },

  // Thématiques - CRUD
  getAllThematics: async () => {
    const [rows] = await db.query("SELECT * FROM quiz_thematics ORDER BY display_order");
    return rows;
  },

  getThematicById: async (id) => {
    const [rows] = await db.query("SELECT * FROM quiz_thematics WHERE thematic_id = ?", [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  createThematic: async ({ title, description, icon_url, color_code, display_order }) => {
    const [result] = await db.query(`
      INSERT INTO quiz_thematics (title, description, icon_url, color_code, display_order)
      VALUES (?, ?, ?, ?, ?)
    `, [title, description, icon_url, color_code, display_order]);
    return result.insertId;
  },

  updateThematic: async (id, { title, description, icon_url, color_code, display_order, is_active }) => {
    const sql = `
      UPDATE quiz_thematics
      SET title = ?, description = ?, color_code = ?, display_order = ?, is_active = ?
      ${icon_url ? ", icon_url = ?" : ""}
      WHERE thematic_id = ?
    `;
    const params = icon_url
      ? [title, description, color_code, display_order, is_active, icon_url, id]
      : [title, description, color_code, display_order, is_active, id];
    
    const [result] = await db.query(sql, params);
    return result;
  },

  deleteThematic: async (id) => {
    const [result] = await db.query("DELETE FROM quiz_thematics WHERE thematic_id = ?", [id]);
    return result;
  }
};

export default quizModel;