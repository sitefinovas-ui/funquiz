import { getAllSettings, updateSettings, getSetting } from "../models/settingsModel.js";

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

export const getMaintenanceStatus = async (_req, res) => {
  try {
    const value = await getSetting("MAINTENANCE_MODE");
    res.json({ maintenance: value === "true" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const setMaintenanceMode = async (req, res) => {
  try {
    const maintenance = Boolean(req.body?.maintenance);
    await updateSettings({ MAINTENANCE_MODE: String(maintenance) });
    res.json({ maintenance });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
