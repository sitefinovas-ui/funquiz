import db from "../config/db.js";

export const getAllSettings = async () => {
  const [rows] = await db.query("SELECT * FROM funquiz_settings");
  // Transformer en objet clé-valeur
  return rows.reduce((acc, row) => {
    acc[row.setting_key] = row.setting_value;
    return acc;
  }, {});
};

export const getSetting = async (key) => {
  const [rows] = await db.query("SELECT setting_value FROM funquiz_settings WHERE setting_key = ?", [key]);
  return rows[0]?.setting_value;
};

export const updateSettings = async (settings) => {
  const keys = Object.keys(settings);
  for (const key of keys) {
    await db.query(
      "INSERT INTO funquiz_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [key, settings[key], settings[key]]
    );
  }
  return true;
};
