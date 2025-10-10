import {
  getAllPublicites,
  getPubliciteById,
  createPublicite,
  updatePublicite,
  deletePublicite,
} from "../models/publiciteModel.js";

export const listPublicites = async (req, res) => {
  try {
    const rows = await getAllPublicites();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Erreur listPublicites", details: e.message });
  }
};

export const getPublicite = async (req, res) => {
  try {
    const pub = await getPubliciteById(req.params.id);
    if (!pub) return res.status(404).json({ error: "Publicité introuvable" });
    res.json(pub);
  } catch (e) {
    res.status(500).json({ error: "Erreur getPublicite", details: e.message });
  }
};

export const createPubliciteCtrl = async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.titre) return res.status(400).json({ error: "Le titre est requis" });
    const created = await createPublicite(data);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: "Erreur createPublicite", details: e.message });
  }
};

export const updatePubliciteCtrl = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body || {};
    const ok = await updatePublicite(id, data);
    if (!ok) return res.status(404).json({ error: "Publicité introuvable" });
    const updated = await getPubliciteById(id);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: "Erreur updatePublicite", details: e.message });
  }
};

export const deletePubliciteCtrl = async (req, res) => {
  try {
    const id = req.params.id;
    const ok = await deletePublicite(id);
    if (!ok) return res.status(404).json({ error: "Publicité introuvable" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Erreur deletePublicite", details: e.message });
  }
};