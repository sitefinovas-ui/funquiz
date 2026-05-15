import db from "../config/db.js";

// Auto-add lien_cta column if missing
(async () => {
  try {
    await db.query(`ALTER TABLE publicite ADD COLUMN lien_cta VARCHAR(500) NULL DEFAULT NULL`);
  } catch (e) {
    if (!e.message?.includes('Duplicate column')) console.error('publicite migration:', e.message);
  }
})();

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
      (titre, description, image_url, date_debut, date_fin, statut, type, clics, lien_cta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    data.lien_cta || null,
  ];
  const [result] = await db.query(sql, params);
  return { id: result.insertId, ...data };
};

export const updatePublicite = async (id, data) => {
  const sql = `
    UPDATE publicite SET
      titre = ?, description = ?, image_url = ?,
      date_debut = ?, date_fin = ?, statut = ?, type = ?, clics = ?, lien_cta = ?
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
    data.lien_cta || null,
    id,
  ];
  const [result] = await db.query(sql, params);
  return result.affectedRows > 0;
};

export const deletePublicite = async (id) => {
  const [result] = await db.query("DELETE FROM publicite WHERE id = ?", [id]);
  return result.affectedRows > 0;
};