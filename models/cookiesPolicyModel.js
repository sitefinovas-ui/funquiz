import db from "../config/db.js";

export const getAllCookies = async () => {
  const [rows] = await db.query("SELECT * FROM cookies_policy ORDER BY date_created DESC");
  return rows;
};
export const getCookiesById = async (id) => {
  const [rows] = await db.query("SELECT * FROM cookies_policy WHERE id = ?", [id]);
  return rows[0] || null;
};
export const createCookies = async ({ title, content, status = "draft" }) => {
  const [res] = await db.query(
    "INSERT INTO cookies_policy (title, content, status) VALUES (?, ?, ?)",
    [title, content, status]
  );
  return res.insertId;
};
export const updateCookies = async (id, { title, content, status }) => {
  const [res] = await db.query(
    "UPDATE cookies_policy SET title = ?, content = ?, status = ? WHERE id = ?",
    [title, content, status, id]
  );
  return res.affectedRows > 0;
};
export const deleteCookies = async (id) => {
  const [res] = await db.query("DELETE FROM cookies_policy WHERE id = ?", [id]);
  return res.affectedRows > 0;
};