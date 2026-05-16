import db from "../config/db.js";

(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS game_cooldowns (
        user_id        INT      NOT NULL PRIMARY KEY,
        cooldown_until DATETIME NOT NULL
      )
    `);
  } catch (e) {
    console.error("❌ game_cooldowns table init:", e.message);
  }
})();

export const getCooldown = async (userId) => {
  const [rows] = await db.query(
    "SELECT cooldown_until FROM game_cooldowns WHERE user_id = ? AND cooldown_until > NOW()",
    [userId]
  );
  return rows[0]?.cooldown_until || null;
};

export const setCooldown = async (userId, minutes) => {
  await db.query(
    `INSERT INTO game_cooldowns (user_id, cooldown_until)
     VALUES (?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
     ON DUPLICATE KEY UPDATE cooldown_until = DATE_ADD(NOW(), INTERVAL ? MINUTE)`,
    [userId, minutes, minutes]
  );
};

export const clearCooldown = async (userId) => {
  await db.query("DELETE FROM game_cooldowns WHERE user_id = ?", [userId]);
};
