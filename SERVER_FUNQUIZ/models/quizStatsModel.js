import db from "../config/db.js";

// Obtenir les statistiques globales des quiz
export const getQuizStats = async () => {
  try {
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM quiz_sub_thematics) as total_quizzes,
        (SELECT COUNT(*) FROM quiz_questions) as total_questions,
        (SELECT COUNT(DISTINCT user_id) FROM quiz_game_history) as total_participants,
        (SELECT COUNT(*) FROM quiz_thematics WHERE is_active = 1) as active_thematics,
        (
          SELECT ROUND(AVG(
            CASE 
              WHEN h.score >= h.max_score THEN 100
              ELSE (h.score / h.max_score) * 100
            END
          ), 2)
          FROM quiz_game_history h
        ) as avg_success_rate,
        (
          SELECT ROUND(AVG(
            (h.score / h.max_score) * 100
          ), 2)
          FROM quiz_game_history h
        ) as avg_score
    `);

    return stats[0];
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
        COUNT(DISTINCT h.user_id) as participant_count,
        ROUND(AVG(
          CASE 
            WHEN h.score >= h.max_score THEN 100
            ELSE (h.score / h.max_score) * 100
          END
        ), 2) as success_rate,
        ROUND(AVG((h.score / h.max_score) * 100), 2) as avg_score
      FROM quiz_thematics t
      LEFT JOIN quiz_sub_thematics st ON t.thematic_id = st.thematic_id
      LEFT JOIN quiz_questions q ON st.sub_thematic_id = q.sub_thematic_id
      LEFT JOIN quiz_game_history h ON st.sub_thematic_id = h.sub_thematic_id
      GROUP BY t.thematic_id
      ORDER BY quiz_count DESC
    `);

    return stats;
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
        h.history_id,
        h.user_id,
        CONCAT(u.first_name, ' ', u.name) AS full_name,
        st.title as quiz_title,
        t.title as thematic_title,
        h.score,
        h.max_score,
        ROUND((h.score / h.max_score) * 100, 2) as success_rate,
        h.played_at
      FROM quiz_game_history h
      JOIN funquiz_users u ON h.user_id = u.user_id
      JOIN quiz_sub_thematics st ON h.sub_thematic_id = st.sub_thematic_id
      JOIN quiz_thematics t ON st.thematic_id = t.thematic_id
      ORDER BY h.played_at DESC
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
        COUNT(DISTINCT h.sub_thematic_id) as quizzes_completed,
        ROUND(AVG(
          CASE 
            WHEN h.score >= h.max_score THEN 100
            ELSE (h.score / h.max_score) * 100
          END
        ), 2) as avg_success_rate,
        SUM(h.score) as total_points,
        MAX(h.played_at) as last_activity
      FROM funquiz_users u
      JOIN quiz_game_history h ON u.user_id = h.user_id
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
        q.difficulty_level,
        COUNT(*) as question_count,
        ROUND(AVG(
          CASE 
            WHEN h.score >= h.max_score THEN 100
            ELSE (h.score / h.max_score) * 100
          END
        ), 2) as success_rate
      FROM quiz_questions q
      LEFT JOIN quiz_game_history h ON q.sub_thematic_id = h.sub_thematic_id
      GROUP BY q.difficulty_level
      ORDER BY q.difficulty_level
    `);

    return stats;
  } catch (error) {
    console.error('❌ [Model] Erreur getDifficultyStats:', error);
    throw error;
  }
};