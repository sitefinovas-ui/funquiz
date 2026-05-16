import db from "../config/db.js";

(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS game_config (
        config_key   VARCHAR(80)  NOT NULL PRIMARY KEY,
        config_value VARCHAR(255) NOT NULL DEFAULT '',
        label        VARCHAR(150) NOT NULL DEFAULT '',
        description  TEXT,
        updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await db.query(`
      INSERT IGNORE INTO game_config (config_key, config_value, label, description) VALUES
      ('max_hearts',       '3',  'Nombre de vies',              'Vies dont dispose chaque joueur au demarrage d''une partie.'),
      ('timer_seconds',    '30', 'Duree du chronometre (s)',     'Temps alloue par question en secondes.'),
      ('max_streak_bonus', '5',  'Bonus de serie max',           'Nombre max de points bonus accordes par serie de bonnes reponses.'),
      ('max_replays',      '2',  'Continues apres game over',    'Nombre de fois qu''un joueur peut continuer apres avoir epuise toutes ses vies.'),
      ('cooldown_minutes', '60', 'Delai avant de rejouer (min)', 'Temps d''attente en minutes avant qu''un joueur puisse relancer une partie apres game over (0 = pas de delai).')
    `);
  } catch (e) {
    console.error("❌ gameConfig table init:", e.message);
  }
})();

export const getAllConfig = async () => {
  const [rows] = await db.query(
    "SELECT config_key, config_value, label, description, updated_at FROM game_config ORDER BY config_key"
  );
  return rows;
};

export const getConfigByKey = async (key) => {
  const [rows] = await db.query(
    "SELECT * FROM game_config WHERE config_key = ?", [key]
  );
  return rows[0] || null;
};

export const upsertConfig = async (key, value, label, description) => {
  await db.query(
    `INSERT INTO game_config (config_key, config_value, label, description)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE config_value = VALUES(config_value),
       label = COALESCE(NULLIF(VALUES(label),''), label),
       description = COALESCE(NULLIF(VALUES(description),''), description)`,
    [key, String(value), label || "", description || ""]
  );
  return getConfigByKey(key);
};

export const deleteConfig = async (key) => {
  await db.query("DELETE FROM game_config WHERE config_key = ?", [key]);
  return true;
};
