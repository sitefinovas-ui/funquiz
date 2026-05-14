import db from "../config/db.js";

/** 🔹 Créer une session de quiz */
export const createQuizSession = async (data) => {
  try {
    const sql = `
      INSERT INTO quiz_user_sessions 
      (user_id, thematic_id, sub_thematic_id, total_questions, difficulty_level, session_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      data.user_id,
      data.thematic_id,
      data.sub_thematic_id || null,
      data.total_questions,
      data.difficulty_level || null,
      JSON.stringify(data.session_data) || null,
    ]);
    return result.insertId;
  } catch (error) {
    console.error("❌ createQuizSession:", error);
    throw new Error("Erreur lors de la création de la session.");
  }
};

/** 🔹 Récupérer une session par ID */
export const getQuizSessionById = async (sessionId) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM quiz_user_sessions WHERE session_id = ?",
      [sessionId],
    );
    return rows[0];
  } catch (error) {
    console.error("❌ getQuizSessionById:", error);
    throw new Error("Erreur lors de la récupération de la session.");
  }
};

/** 🔹 Mettre à jour la progression d’une session */
export const updateQuizSessionProgress = async (sessionId, data) => {
  try {
    const sql = `
      UPDATE quiz_user_sessions SET
        current_question_index = ?,
        answered_questions = ?,
        current_score = ?,
        correct_answers_count = ?,
        last_activity = NOW(),
        is_completed = ?
      WHERE session_id = ?
    `;
    await db.query(sql, [
      data.current_question_index,
      JSON.stringify(data.answered_questions || []),
      data.current_score,
      data.correct_answers_count,
      data.is_completed || 0,
      sessionId,
    ]);
  } catch (error) {
    console.error("❌ updateQuizSessionProgress:", error);
    throw new Error("Erreur lors de la mise à jour de la session.");
  }
};

/** 🔹 Terminer une session */
export const completeQuizSession = async (sessionId) => {
  try {
    await db.query(
      "UPDATE quiz_user_sessions SET is_completed = 1, last_activity = NOW() WHERE session_id = ?",
      [sessionId],
    );
  } catch (error) {
    console.error("❌ completeQuizSession:", error);
    throw new Error("Erreur lors de la finalisation de la session.");
  }
};

/** 🔹 Récupérer les sessions d’un utilisateur */
export const getUserQuizSessions = async (userId) => {
  try {
    const sql = `
      SELECT 
        s.*, 
        t.title AS thematic_title, 
        st.title AS sub_thematic_title
      FROM quiz_user_sessions s
      LEFT JOIN quiz_thematics t ON s.thematic_id = t.thematic_id
      LEFT JOIN quiz_sub_thematics st ON s.sub_thematic_id = st.sub_thematic_id
      WHERE s.user_id = ? 
      ORDER BY s.last_activity DESC
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  } catch (error) {
    console.error("❌ getUserQuizSessions:", error);
    throw new Error("Erreur lors de la récupération des sessions utilisateur.");
  }
};
