import db from "../config/db.js";

export const getAllPublicites = async () => {
  const [rows] = await db.query(
    "SELECT * FROM publicite ORDER BY created_at DESC"
  );
  return rows;
};

export const getPubliciteById = async (id) => {
  const [rows] = await db.query("SELECT * FROM publicite WHERE id = ?", [id]);
  return rows[0] || null;
};

export const createPublicite = async (data) => {
  const sql = `
    INSERT INTO publicite
      (titre, description, image_url, date_debut, date_fin, statut, type, clics)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.titre,
    data.description || null,
    data.image_url || null,
    data.date_debut || null,
    data.date_fin || null,
    data.statut || 'inactif',
    data.type || 'image',
    data.clics || 0,
  ];
  const [result] = await db.query(sql, params);
  return { id: result.insertId, ...data };
};

export const updatePublicite = async (id, data) => {
  const sql = `
    UPDATE publicite SET
      titre = ?, description = ?, image_url = ?,
      date_debut = ?, date_fin = ?, statut = ?, type = ?, clics = ?
    WHERE id = ?
  `;
  const params = [
    data.titre,
    data.description || null,
    data.image_url || null,
    data.date_debut || null,
    data.date_fin || null,
    data.statut || 'inactif',
    data.type || 'image',
    data.clics ?? 0,
    id,
  ];
  const [result] = await db.query(sql, params);
  return result.affectedRows > 0;
};

export const deletePublicite = async (id) => {
  const [result] = await db.query("DELETE FROM publicite WHERE id = ?", [id]);
  return result.affectedRows > 0;
};