import db from "../config/db.js";

/**
 * Log une action effectuée par un modérateur ou admin
 */
export const logModeratorAction = async ({ moderator_id, action_type, target_type, target_id, details }) => {
  try {
    const [res] = await db.query(
      "INSERT INTO moderator_actions (moderator_id, action_type, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)",
      [moderator_id, action_type, target_type, target_id || null, details || null]
    );
    return res.insertId;
  } catch (error) {
    console.error("❌ Error logging moderator action:", error);
    return null;
  }
};

/**
 * Récupère toutes les actions des modérateurs (pour l'admin)
 */
export const getAllModeratorActions = async () => {
  const sql = `
    SELECT a.*, u.name, u.first_name, u.email, u.role
    FROM moderator_actions a
    JOIN funquiz_users u ON a.moderator_id = u.user_id
    ORDER BY a.created_at DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
};
