import { getAllCGU, getCGUById, createCGU, updateCGU, deleteCGU } from "../models/cguModel.js";

export const listCGU = async (req, res) => {
  const rows = await getAllCGU();
  res.json(rows);
};
export const cguById = async (req, res) => {
  const row = await getCGUById(req.params.id);
  if (!row) return res.status(404).json({ error: "CGU non trouvée" });
  res.json(row);
};
export const addCGU = async (req, res) => {
  const { title, content, status } = req.body;
  if (!title || !content) return res.status(400).json({ error: "title et content requis" });
  const id = await createCGU({ title, content, status });
  res.status(201).json({ id });
};
export const editCGU = async (req, res) => {
  const ok = await updateCGU(req.params.id, req.body);
  if (!ok) return res.status(404).json({ error: "CGU non trouvée" });
  res.json({ success: true });
};
export const removeCGU = async (req, res) => {
  const ok = await deleteCGU(req.params.id);
  if (!ok) return res.status(404).json({ error: "CGU non trouvée" });
  res.json({ success: true });
};