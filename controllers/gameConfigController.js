import {
  getAllConfig,
  getConfigByKey,
  upsertConfig,
  deleteConfig,
} from "../models/gameConfigModel.js";

export const listConfig = async (req, res) => {
  try {
    const rows = await getAllConfig();
    res.json(rows);
  } catch (e) {
    console.error("❌ listConfig:", e);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const getConfig = async (req, res) => {
  try {
    const row = await getConfigByKey(req.params.key);
    if (!row) return res.status(404).json({ error: "Clé introuvable." });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const putConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { config_value, value, label, description } = req.body;
    const val = config_value ?? value;
    if (val === undefined || val === null) {
      return res.status(400).json({ error: "config_value requis." });
    }
    const row = await upsertConfig(key, val, label, description);
    res.json(row);
  } catch (e) {
    console.error("❌ putConfig:", e);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const postConfig = async (req, res) => {
  try {
    const { config_key, config_value, label, description } = req.body;
    if (!config_key || config_value === undefined) {
      return res.status(400).json({ error: "config_key et config_value requis." });
    }
    const row = await upsertConfig(config_key, config_value, label, description);
    res.status(201).json(row);
  } catch (e) {
    console.error("❌ postConfig:", e);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const removeConfig = async (req, res) => {
  try {
    await deleteConfig(req.params.key);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};
