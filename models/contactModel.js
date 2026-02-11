import db from "../config/db.js";

export const getAllContacts = async () => {
  const [rows] = await db.query("SELECT * FROM contact ORDER BY created_at DESC");
  return rows;
};
export const getContactById = async (id) => {
  const [rows] = await db.query("SELECT * FROM contact WHERE id = ?", [id]);
  return rows[0] || null;
};
export const createContact = async ({ service, email, content, status = "operationnel" }) => {
  const [res] = await db.query(
    "INSERT INTO contact (service, email, content, status) VALUES (?, ?, ?, ?)",
    [service, email, content, status]
  );
  return res.insertId;
};
export const updateContact = async (id, { service, email, content, status }) => {
  const [res] = await db.query(
    "UPDATE contact SET service = ?, email = ?, content = ?, status = ? WHERE id = ?",
    [service, email, content, status, id]
  );
  return res.affectedRows > 0;
};
export const deleteContact = async (id) => {
  const [res] = await db.query("DELETE FROM contact WHERE id = ?", [id]);
  return res.affectedRows > 0;
};