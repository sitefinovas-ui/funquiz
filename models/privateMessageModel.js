import db from "../config/db.js";

export const createPrivateMessage = async ({ sender_id, receiver_id, content }) => {
  if (!sender_id || !receiver_id || !content) {
    throw new Error("Champs requis manquants.");
  }

  const [result] = await db.query(
    `INSERT INTO funquiz_private_messages (sender_id, receiver_id, content)
     VALUES (?, ?, ?)`,
    [sender_id, receiver_id, content]
  );

  const [rows] = await db.query(
    `SELECT pm.*, u.name AS sender_name, u.first_name AS sender_first_name, u.avatar_url AS sender_avatar_url
     FROM funquiz_private_messages pm
     LEFT JOIN funquiz_users u ON u.user_id = pm.sender_id
     WHERE pm.message_id = ?`,
    [result.insertId]
  );

  return rows[0];
};

export const getThreadMessages = async (user_id, other_id) => {
  const [rows] = await db.query(
    `SELECT pm.*, u.name AS sender_name, u.first_name AS sender_first_name, u.avatar_url AS sender_avatar_url
     FROM funquiz_private_messages pm
     LEFT JOIN funquiz_users u ON u.user_id = pm.sender_id
     WHERE (pm.sender_id = ? AND pm.receiver_id = ?) OR (pm.sender_id = ? AND pm.receiver_id = ?)
     ORDER BY pm.created_at ASC`,
    [user_id, other_id, other_id, user_id]
  );
  return rows;
};

export const getConversationsForUser = async (user_id) => {
  const [rows] = await db.query(
    `SELECT
        u.user_id,
        u.name,
        u.first_name,
        u.role,
        u.avatar_url,
        last_pm.content AS last_message,
        last_pm.created_at AS last_at,
        COALESCE(unread.unread_count, 0) AS unread_count
     FROM (
        SELECT
          CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_id,
          MAX(created_at) AS last_at
        FROM funquiz_private_messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY other_id
     ) conv
     JOIN funquiz_private_messages last_pm
       ON (
            (last_pm.sender_id = ? AND last_pm.receiver_id = conv.other_id)
            OR (last_pm.sender_id = conv.other_id AND last_pm.receiver_id = ?)
          )
       AND last_pm.created_at = conv.last_at
     JOIN funquiz_users u ON u.user_id = conv.other_id
     LEFT JOIN (
        SELECT sender_id AS other_id, COUNT(*) AS unread_count
        FROM funquiz_private_messages
        WHERE receiver_id = ? AND read_at IS NULL
        GROUP BY sender_id
     ) unread ON unread.other_id = conv.other_id
     ORDER BY last_at DESC`,
    [user_id, user_id, user_id, user_id, user_id, user_id]
  );
  return rows;
};

export const markThreadRead = async (user_id, other_id) => {
  const [result] = await db.query(
    `UPDATE funquiz_private_messages
     SET read_at = CURRENT_TIMESTAMP
     WHERE receiver_id = ? AND sender_id = ? AND read_at IS NULL`,
    [user_id, other_id]
  );
  return { updated: result.affectedRows || 0 };
};
