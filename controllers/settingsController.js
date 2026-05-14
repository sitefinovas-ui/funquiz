import { getAllSettings, updateSettings } from "../models/settingsModel.js";

export const listSettings = async (req, res) => {
  try {
    const settings = await getAllSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const saveSettings = async (req, res) => {
  try {
    await updateSettings(req.body);
    res.json({ message: "Paramètres sauvegardés avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
