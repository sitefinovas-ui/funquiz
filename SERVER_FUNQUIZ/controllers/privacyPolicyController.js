import { getAllPrivacy, getPrivacyById, createPrivacy, updatePrivacy, deletePrivacy } from "../models/privacyPolicyModel.js";

export const listPrivacy = async (req, res) => res.json(await getAllPrivacy());
export const privacyById = async (req, res) => {
  const row = await getPrivacyById(req.params.id);
  if (!row) return res.status(404).json({ error: "Politique de confidentialité non trouvée" });
  res.json(row);
};
export const addPrivacy = async (req, res) => {
  const { title, content, status } = req.body;
  if (!title || !content) return res.status(400).json({ error: "title et content requis" });
  const id = await createPrivacy({ title, content, status });
  res.status(201).json({ id });
};
export const editPrivacy = async (req, res) => {
  const ok = await updatePrivacy(req.params.id, req.body);
  if (!ok) return res.status(404).json({ error: "Politique non trouvée" });
  res.json({ success: true });
};
export const removePrivacy = async (req, res) => {
  const ok = await deletePrivacy(req.params.id);
  if (!ok) return res.status(404).json({ error: "Politique non trouvée" });
  res.json({ success: true });
};