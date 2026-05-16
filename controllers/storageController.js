import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "thematics");
const IMAGE_EXT  = /\.(jpg|jpeg|png|webp|gif|svg)$/i;

export const listImages = (_req, res) => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) return res.json([]);
    const files = fs.readdirSync(UPLOAD_DIR)
      .filter(f => IMAGE_EXT.test(f))
      .map(f => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, f));
        return {
          filename: f,
          icon_url: `/uploads/thematics/${f}`,  // enrichi par le middleware BASE_URL
          path: `/uploads/thematics/${f}`,       // chemin relatif brut (non modifié)
          size: stat.size,
          created_at: stat.birthtime,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(files);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });
  res.json({
    filename: req.file.filename,
    icon_url: `/uploads/thematics/${req.file.filename}`,
    path: `/uploads/thematics/${req.file.filename}`,
  });
};

export const deleteImage = (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      return res.status(400).json({ error: "Nom de fichier invalide" });
    }
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Fichier introuvable" });
    fs.unlinkSync(filePath);
    res.json({ message: "Fichier supprimé" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
