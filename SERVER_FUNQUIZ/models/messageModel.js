import db from "../config/db.js";

// ✅ Récupérer tous les messages
export const getAllMessagesData = async () => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM funquiz_messages ORDER BY created_at DESC",
    );
    return rows;
  } catch (error) {
    console.error("❌ getAllMessagesData:", error);
    throw new Error("Erreur lors de la récupération des messages.");
  }
};

// ✅ Récupérer un message par ID
export const getMessageById = async (message_id) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM funquiz_messages WHERE message_id = ?",
      [message_id],
    );
    return rows[0] ? rows[0] : null;
  } catch (error) {
    console.error("❌ getMessageById:", error);
    throw new Error("Erreur lors de la récupération du message.");
  }
};

// ✅ Créer un message
export const createMessage = async (data) => {
  try {
    const {
      user_id = null,
      admin_id = null,
      name,
      email,
      subject,
      content,
      content_admin = null,
      priority = "normal",
      status = "unread",
      assigned_to = null,
    } = data;

    const [result] = await db.query(
      `INSERT INTO funquiz_messages (
         user_id, admin_id, name, email, subject, content, content_admin, priority, status, assigned_to
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        admin_id,
        name,
        email,
        subject,
        content,
        content_admin,
        priority,
        status,
        assigned_to,
      ],
    );

    return {
      message_id: result.insertId,
      user_id,
      admin_id,
      name,
      email,
      subject,
      content,
      content_admin,
      priority,
      status,
      assigned_to,
    };
  } catch (error) {
    console.error("❌ createMessage error:", error);
    throw error;
  }
};

// ✅ Mettre à jour un message
export const updateMessage = async (message_id, data) => {
  try {
    if (!message_id) throw new Error("message_id requis.");

    const { subject, content, content_admin, priority, status, assigned_to, admin_id } = data;
    const fields = [];
    const values = [];

    if (subject !== undefined) {
      fields.push("subject = ?");
      values.push(subject);
    }
    if (content !== undefined) {
      fields.push("content = ?");
      values.push(content);
    }
    if (content_admin !== undefined) {
      fields.push("content_admin = ?");
      values.push(content_admin);
    }
    if (priority !== undefined) {
      fields.push("priority = ?");
      values.push(priority);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      values.push(status);
    }
    if (assigned_to !== undefined) {
      fields.push("assigned_to = ?");
      values.push(assigned_to);
    }
    if (admin_id !== undefined) {
      fields.push("admin_id = ?");
      values.push(admin_id);
    }

    if (fields.length === 0) throw new Error("Aucun champ à mettre à jour.");

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(message_id);

    const sql = `UPDATE funquiz_messages SET ${fields.join(", ")} WHERE message_id = ?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) throw new Error("Message non trouvé.");

    return { message_id, ...data };
  } catch (error) {
    console.error("❌ updateMessage error:", error);
    throw error;
  }
};

// ✅ Supprimer un message
export const deleteMessage = async (message_id) => {
  try {
    if (!message_id) throw new Error("message_id requis.");

    const [result] = await db.query(
      "DELETE FROM funquiz_messages WHERE message_id = ?",
      [message_id],
    );
    if (result.affectedRows === 0) throw new Error("Message non trouvé.");

    return { message_id };
  } catch (error) {
    console.error("❌ deleteMessage error:", error);
    throw error;
  }
};
