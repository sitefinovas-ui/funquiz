import { getAllAbout, getAboutById, createAbout, updateAbout, deleteAbout } from "../models/aboutModel.js";

export const listAbout = async (req, res) => res.json(await getAllAbout());
export const aboutById = async (req, res) => {
  const row = await getAboutById(req.params.id);
  if (!row) return res.status(404).json({ error: "À propos non trouvé" });
  res.json(row);
};
export const addAbout = async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) return res.status(400).json({ error: "title et description requis" });
  const id = await createAbout(req.body);
  res.status(201).json({ id });
};
export const editAbout = async (req, res) => {
  const ok = await updateAbout(req.params.id, req.body);
  if (!ok) return res.status(404).json({ error: "À propos non trouvé" });
  res.json({ success: true });
};
export const removeAbout = async (req, res) => {
  const ok = await deleteAbout(req.params.id);
  if (!ok) return res.status(404).json({ error: "À propos non trouvé" });
  res.json({ success: true });
};