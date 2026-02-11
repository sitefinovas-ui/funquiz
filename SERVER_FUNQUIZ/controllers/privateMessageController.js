import {
  createPrivateMessage,
  getThreadMessages,
  getConversationsForUser,
  markThreadRead,
} from "../models/privateMessageModel.js";
import db from "../config/db.js";

const isStaffRole = (role) => role === "admin" || role === "moderator";

const canMessagePair = ({ senderRole, receiverRole }) => {
  const senderStaff = isStaffRole(senderRole);
  const receiverStaff = isStaffRole(receiverRole);
  if (senderStaff && !receiverStaff) return true;
  if (!senderStaff && receiverStaff) return true;
  return false;
};

const getUserRoleById = async (userId) => {
  const [rows] = await db.query(`SELECT role FROM funquiz_users WHERE user_id = ? LIMIT 1`, [
    Number(userId),
  ]);
  return rows?.[0]?.role || null;
};

export const listConversations = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const myRole = req.user?.role || "user";
    const rows = await getConversationsForUser(user_id);
    const filtered = (Array.isArray(rows) ? rows : []).filter((t) => {
      const otherRole = t?.role || null;
      if (!otherRole) return false;
      if (isStaffRole(myRole)) return !isStaffRole(otherRole);
      return isStaffRole(otherRole);
    });
    res.json(filtered);
  } catch (error) {
    console.error("listConversations:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des conversations." });
  }
};

export const getThread = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const myRole = req.user?.role || "user";
    const other_id = Number(req.params.userId);
    if (!other_id) return res.status(400).json({ error: "userId requis" });

    const otherRole = await getUserRoleById(other_id);
    if (!otherRole) return res.status(404).json({ error: "Utilisateur non trouvé" });
    if (!canMessagePair({ senderRole: myRole, receiverRole: otherRole })) {
      return res.status(403).json({ error: "Conversation non autorisée" });
    }

    const rows = await getThreadMessages(user_id, other_id);
    res.json(rows);
  } catch (error) {
    console.error("getThread:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du thread." });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const sender_id = req.user?.user_id;
    const senderRole = req.user?.role || "user";
    const { receiver_id, content } = req.body || {};
    if (!receiver_id || !content?.trim()) {
      return res.status(400).json({ error: "receiver_id et content requis" });
    }

    const receiverRole = await getUserRoleById(receiver_id);
    if (!receiverRole) return res.status(404).json({ error: "Utilisateur non trouvé" });
    if (!canMessagePair({ senderRole, receiverRole })) {
      return res.status(403).json({ error: "Envoi non autorisé" });
    }

    const saved = await createPrivateMessage({
      sender_id,
      receiver_id: Number(receiver_id),
      content: content.trim(),
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${receiver_id}`).emit("private:message", saved);
      io.to(`user:${sender_id}`).emit("private:message", saved);
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error("sendMessage:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi du message." });
  }
};

export const markRead = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const { other_id } = req.body || {};
    if (!other_id) return res.status(400).json({ error: "other_id requis" });

    const myRole = req.user?.role || "user";
    const otherRole = await getUserRoleById(other_id);
    if (!otherRole) return res.status(404).json({ error: "Utilisateur non trouvé" });
    if (!canMessagePair({ senderRole: myRole, receiverRole: otherRole })) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    const result = await markThreadRead(user_id, Number(other_id));

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${other_id}`).emit("private:read", { by: user_id });
    }

    res.json(result);
  } catch (error) {
    console.error("markRead:", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
};
