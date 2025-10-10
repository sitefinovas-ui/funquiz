import { getAllCookies, getCookiesById, createCookies, updateCookies, deleteCookies } from "../models/cookiesPolicyModel.js";

export const listCookies = async (req, res) => res.json(await getAllCookies());
export const cookiesById = async (req, res) => {
  const row = await getCookiesById(req.params.id);
  if (!row) return res.status(404).json({ error: "Politique cookies non trouvée" });
  res.json(row);
};
export const addCookies = async (req, res) => {
  const { title, content, status } = req.body;
  if (!title || !content) return res.status(400).json({ error: "title et content requis" });
  const id = await createCookies({ title, content, status });
  res.status(201).json({ id });
};
export const editCookies = async (req, res) => {
  const ok = await updateCookies(req.params.id, req.body);
  if (!ok) return res.status(404).json({ error: "Politique non trouvée" });
  res.json({ success: true });
};
export const removeCookies = async (req, res) => {
  const ok = await deleteCookies(req.params.id);
  if (!ok) return res.status(404).json({ error: "Politique non trouvée" });
  res.json({ success: true });
};