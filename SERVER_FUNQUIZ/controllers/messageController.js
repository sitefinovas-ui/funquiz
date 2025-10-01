import {
  getAllMessagesData,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
} from "../models/messageModel.js";
import {mailMessage} from '../utils/mail.js'

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
    const { name, email, subject, content } = req.body;
    if (!name || !email || !subject || !content) {
      return res.status(400).json({ error: "Les champs name, email, subject et content sont requis." });
    }

    const newMessage = await createMessage(req.body);
    await mailMessage (email, name)
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mettre à jour un message
export const editMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const updatedMessage = await updateMessage(message_id, req.body);
    res.status(200).json(updatedMessage);
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
