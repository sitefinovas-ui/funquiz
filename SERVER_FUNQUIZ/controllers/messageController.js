import {
  getAllMessagesData,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
} from "../models/messageModel.js";
import { mailMessageReply, mailMessageReceived } from "../utils/mail.js";

// ✅ Récupérer tous les messages
export const allMessageData = async (req, res) => {
  try {
    const data = await getAllMessagesData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Récupérer un message par ID
export const MessageById = async (req, res) => {
  try {
    const { message_id } = req.params;
    const data = await getMessageById(message_id);
    if (!data) return res.status(404).json({ error: "Message non trouvé." });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Créer un message
export const addMessage = async (req, res) => {
  try {
    const { name, email, subject, content, content_admin } = req.body;

    if (!subject || (!content && !content_admin)) {
      return res
        .status(400)
        .json({
          error: "Le champ subject et au moins un contenu (content ou content_admin) sont requis.",
        });
    }

    const newMessage = await createMessage(req.body);

    // Envoi email selon le contexte
    if (email) {
      if (content_admin) {
        await mailMessageReply(email, name || "Utilisateur", content_admin, subject);
      } else if (content) {
        await mailMessageReceived(email, name || "Utilisateur", subject, content);
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mettre à jour un message
export const editMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const { email, name, content, content_admin, status, subject, priority, assigned_to } =
      req.body;

    const updatedMessage = await updateMessage(message_id, {
      content,
      content_admin,
      status,
      subject,
      priority,
      assigned_to,
      updated_at: new Date(),
    });

    // Email de réponse admin
    const bodyToSend = content_admin ?? content;
    if (email && bodyToSend) {
      await mailMessageReply(email, name || "Utilisateur", bodyToSend, subject);
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du message:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Envoyer un email direct (admin)
export const sendEmailDirect = async (req, res) => {
  try {
    const { email, name, subject, content } = req.body;
    if (!email || !subject || !content) {
      return res
        .status(400)
        .json({ error: "Les champs email, subject et content sont requis." });
    }
    await mailMessageReply(email, name || "Utilisateur", content, subject);
    return res.status(200).json({ success: true, message: "Email envoyé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Supprimer un message
export const removeMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const deletedMessage = await deleteMessage(message_id);
    res.status(200).json({ success: true, deletedMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
