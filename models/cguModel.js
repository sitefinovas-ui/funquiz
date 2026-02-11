import db from "../config/db.js";

export const getAllCGU = async () => {
  const [rows] = await db.query("SELECT * FROM cgu ORDER BY date_created DESC");
  return rows;
};

export const getCGUById = async (id) => {
  const [rows] = await db.query("SELECT * FROM cgu WHERE id = ?", [id]);
  return rows[0] || null;
};

export const createCGU = async ({ title, content, status = "draft" }) => {
  const [res] = await db.query(
    "INSERT INTO cgu (title, content, status) VALUES (?, ?, ?)",
    [title, content, status]
  );
  return res.insertId;
};

export const updateCGU = async (id, { title, content, status }) => {
  const [res] = await db.query(
    "UPDATE cgu SET title = ?, content = ?, status = ? WHERE id = ?",
    [title, content, status, id]
  );
  return res.affectedRows > 0;
};

export const deleteCGU = async (id) => {
  const [res] = await db.query("DELETE FROM cgu WHERE id = ?", [id]);
  return res.affectedRows > 0;
};