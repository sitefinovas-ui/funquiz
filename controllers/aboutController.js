import { getAllAbout, getAboutById, createAbout, updateAbout, deleteAbout } from "../models/aboutModel.js";

export const listAbout = async (req, res) => {
  try {
    const data = await getAllAbout();
    res.json(data);
  } catch (error) {
    console.error("Erreur listAbout:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des données" });
  }
};

export const aboutById = async (req, res) => {
  try {
    const row = await getAboutById(req.params.id);
    if (!row) return res.status(404).json({ error: "À propos non trouvé" });
    res.json(row);
  } catch (error) {
    console.error("Erreur aboutById:", error);
    res.status(500).json({ error: "Erreur lors de la récupération de l'élément" });
  }
};

export const addAbout = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Titre et description requis" });
    const id = await createAbout(req.body);
    res.status(201).json({ id });
  } catch (error) {
    console.error("Erreur addAbout:", error);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

export const editAbout = async (req, res) => {
  try {
    const ok = await updateAbout(req.params.id, req.body);
    if (!ok) return res.status(404).json({ error: "À propos non trouvé" });
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur editAbout:", error);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
};

export const removeAbout = async (req, res) => {
  try {
    const ok = await deleteAbout(req.params.id);
    if (!ok) return res.status(404).json({ error: "À propos non trouvé" });
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur removeAbout:", error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};