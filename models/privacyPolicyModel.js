import db from "../config/db.js";

export const getAllPrivacy = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM privacy_policy ORDER BY date_created DESC");
    return rows;
  } catch (error) {
    console.error("❌ getAllPrivacy Model Error:", error);
    throw error;
  }
};
export const getPrivacyById = async (id) => {
  const [rows] = await db.query("SELECT * FROM privacy_policy WHERE id = ?", [id]);
  return rows[0] || null;
};
export const createPrivacy = async ({ title, content, status = "draft" }) => {
  const [res] = await db.query(
    "INSERT INTO privacy_policy (title, content, status) VALUES (?, ?, ?)",
    [title, content, status]
  );
  return res.insertId;
};
export const updatePrivacy = async (id, { title, content, status }) => {
  const [res] = await db.query(
    "UPDATE privacy_policy SET title = ?, content = ?, status = ? WHERE id = ?",
    [title, content, status, id]
  );
  return res.affectedRows > 0;
};
export const deletePrivacy = async (id) => {
  const [res] = await db.query("DELETE FROM privacy_policy WHERE id = ?", [id]);
  return res.affectedRows > 0;
};