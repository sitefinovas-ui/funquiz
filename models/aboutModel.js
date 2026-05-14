import db from "../config/db.js";

export const getAllAbout = async () => {
  const [rows] = await db.query("SELECT * FROM about ORDER BY created_at DESC");
  return rows;
};
export const getAboutById = async (id) => {
  const [rows] = await db.query("SELECT * FROM about WHERE id = ?", [id]);
  return rows[0] || null;
};
export const createAbout = async ({ title, subtitle, description, mission, vision, contact_email, status }) => {
  const [res] = await db.query(
    "INSERT INTO about (title, subtitle, description, mission, vision, contact_email, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, subtitle || null, description, mission || null, vision || null, contact_email || null, status || 'published']
  );
  return res.insertId;
};
export const updateAbout = async (id, { title, subtitle, description, mission, vision, contact_email, status }) => {
  const [res] = await db.query(
    "UPDATE about SET title = ?, subtitle = ?, description = ?, mission = ?, vision = ?, contact_email = ?, status = ? WHERE id = ?",
    [title, subtitle || null, description, mission || null, vision || null, contact_email || null, status || 'published', id]
  );
  return res.affectedRows > 0;
};
export const deleteAbout = async (id) => {
  const [res] = await db.query("DELETE FROM about WHERE id = ?", [id]);
  return res.affectedRows > 0;
};