import db from "../config/db.js";

// Obtenir les statistiques globales des quiz
export const getQuizStats = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM quiz_sub_thematics) as total_quizzes,
        (SELECT COUNT(*) FROM quiz_questions) as total_questions,
        (SELECT COUNT(DISTINCT user_id) FROM quiz_user_sessions WHERE is_completed = 1) as total_participants,
        (SELECT COUNT(*) FROM quiz_thematics WHERE is_active = 1) as active_thematics,
        (
          SELECT ROUND(AVG((correct_answers_count / NULLIF(total_questions, 0)) * 100), 2)
          FROM quiz_user_sessions
          WHERE is_completed = 1
        ) as avg_success_rate,
        (
          SELECT ROUND(AVG((correct_answers_count / NULLIF(total_questions, 0)) * 100), 2)
          FROM quiz_user_sessions
          WHERE is_completed = 1
        ) as avg_score
    `);

    return rows?.[0] || {};
  } catch (error) {
    console.error('❌ [Model] Erreur getQuizStats:', error);
    throw error;
  }
};

// Obtenir les statistiques par thématique
export const getThematicStats = async () => {
  try {
    const [stats] = await db.query(`
      SELECT 
        t.thematic_id,
        t.title as thematic_title,
        COUNT(DISTINCT st.sub_thematic_id) as quiz_count,
        COUNT(DISTINCT q.question_id) as question_count,
        COUNT(DISTINCT s.user_id) as participant_count,
        ROUND(AVG((s.correct_answers_count / NULLIF(s.total_questions, 0)) * 100), 2) as success_rate,
        ROUND(AVG((s.correct_answers_count / NULLIF(s.total_questions, 0)) * 100), 2) as avg_score
      FROM quiz_thematics t
      LEFT JOIN quiz_sub_thematics st ON t.thematic_id = st.thematic_id
      LEFT JOIN quiz_questions q ON st.sub_thematic_id = q.sub_thematic_id
      LEFT JOIN quiz_user_sessions s 
        ON s.thematic_id = t.thematic_id
        AND s.is_completed = 1
      GROUP BY t.thematic_id
      ORDER BY quiz_count DESC
    `);

    return stats || [];
  } catch (error) {
    console.error('❌ [Model] Erreur getThematicStats:', error);
    throw error;
  }
};

// Obtenir les statistiques d'activité récente
export const getRecentActivity = async (limit = 10) => {
  try {
    const [activities] = await db.query(`
      SELECT 
        s.session_id as history_id,
        s.user_id,
        CONCAT(u.first_name, ' ', u.name) AS full_name,
        COALESCE(
          JSON_UNQUOTE(JSON_EXTRACT(s.session_data, '$.subTitle')),
          st.title,
          'Quiz'
        ) as quiz_title,
        COALESCE(
          JSON_UNQUOTE(JSON_EXTRACT(s.session_data, '$.thematicTitle')),
          t.title,
          'Thématique'
        ) as thematic_title,
        s.current_score as score,
        s.total_questions as max_score,
        ROUND((s.correct_answers_count / NULLIF(s.total_questions, 0)) * 100, 2) as success_rate,
        s.last_activity as played_at
      FROM quiz_user_sessions s
      JOIN funquiz_users u ON s.user_id = u.user_id
      LEFT JOIN quiz_sub_thematics st ON s.sub_thematic_id = st.sub_thematic_id
      LEFT JOIN quiz_thematics t ON s.thematic_id = t.thematic_id
      ORDER BY s.last_activity DESC
      LIMIT ?
    `, [limit]);

    return activities;
  } catch (error) {
    console.error('❌ [Model] Erreur getRecentActivity:', error);
    throw error;
  }
};

// Obtenir le classement des utilisateurs
export const getUserRankings = async (limit = 10) => {
  try {
    const [rankings] = await db.query(`
      SELECT 
        u.user_id,
        CONCAT(u.first_name, ' ', u.name) AS full_name,
        COUNT(DISTINCT s.session_id) as quizzes_completed,
        ROUND(AVG(
          CASE 
            WHEN (s.correct_answers_count / NULLIF(s.total_questions, 0)) >= 1 THEN 100
            ELSE (s.correct_answers_count / NULLIF(s.total_questions, 0)) * 100
          END
        ), 2) as avg_success_rate,
        SUM(s.current_score) as total_points,
        MAX(s.last_activity) as last_activity
      FROM funquiz_users u
      JOIN quiz_user_sessions s ON u.user_id = s.user_id AND s.is_completed = 1
      GROUP BY u.user_id
      ORDER BY total_points DESC, avg_success_rate DESC
      LIMIT ?
    `, [limit]);

    return rankings;
  } catch (error) {
    console.error('❌ [Model] Erreur getUserRankings:', error);
    throw error;
  }
};

// Obtenir les statistiques de difficulté
export const getDifficultyStats = async () => {
  try {
    const [stats] = await db.query(`
      SELECT 
        s.difficulty_level,
        COUNT(*) as session_count,
        ROUND(AVG((s.correct_answers_count / NULLIF(s.total_questions, 0)) * 100), 2) as success_rate
      FROM quiz_user_sessions s
      WHERE s.is_completed = 1 AND s.difficulty_level IS NOT NULL
      GROUP BY s.difficulty_level
      ORDER BY s.difficulty_level
    `);

    return stats;
  } catch (error) {
    console.error('❌ [Model] Erreur getDifficultyStats:', error);
    throw error;
  }
};
