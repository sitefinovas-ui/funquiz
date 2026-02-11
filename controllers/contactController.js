import { getAllContacts, getContactById, createContact, updateContact, deleteContact } from "../models/contactModel.js";

export const listContacts = async (req, res) => res.json(await getAllContacts());
export const contactById = async (req, res) => {
  const row = await getContactById(req.params.id);
  if (!row) return res.status(404).json({ error: "Contact non trouvé" });
  res.json(row);
};
export const addContact = async (req, res) => {
  const { service, email, content, status } = req.body;
  if (!service || !email || !content) {
    return res.status(400).json({ error: "service, email, content requis" });
  }
  const allowed = ["operationnel", "cacher"];
  const safeStatus = allowed.includes(status) ? status : "operationnel";
  const id = await createContact({ service, email, content, status: safeStatus });
  res.status(201).json({ id });
};
export const editContact = async (req, res) => {
  const { service, email, content, status } = req.body;
  const allowed = ["operationnel", "cacher"];
  const safeStatus = allowed.includes(status) ? status : "operationnel";
  const ok = await updateContact(req.params.id, { service, email, content, status: safeStatus });
  if (!ok) return res.status(404).json({ error: "Contact non trouvé" });
  res.json({ success: true });
};
export const removeContact = async (req, res) => {
  const ok = await deleteContact(req.params.id);
  if (!ok) return res.status(404).json({ error: "Contact non trouvé" });
  res.json({ success: true });
};