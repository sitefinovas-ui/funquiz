import db from "../config/db.js";

// ✅ Récupérer tous les messages
export const getAllMessagesData = async () => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, fu.avatar_url
       FROM funquiz_messages m
       LEFT JOIN funquiz_users fu ON fu.user_id = m.user_id
       ORDER BY m.created_at DESC`
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
      `SELECT m.*, fu.avatar_url
       FROM funquiz_messages m
       LEFT JOIN funquiz_users fu ON fu.user_id = m.user_id
       WHERE m.message_id = ?`,
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

    const values = [
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
    ];

    try {
      const [result] = await db.query(
        `INSERT INTO funquiz_messages (
           user_id, admin_id, name, email, subject, content, content_admin, priority, status, assigned_to
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values,
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
      const isNoDefaultMessageId =
        error?.code === "ER_NO_DEFAULT_FOR_FIELD" && /message_id/i.test(error?.sqlMessage || "");
      if (!isNoDefaultMessageId) throw error;

      // Compatibilité: certaines bases n'ont pas AUTO_INCREMENT sur message_id.
      // On génère un ID incrémental et on réessaie.
      let message_id = 1;
      try {
        const [rows] = await db.query(
          "SELECT COALESCE(MAX(message_id), 0) + 1 AS next_id FROM funquiz_messages",
        );
        message_id = Number(rows?.[0]?.next_id) || 1;
      } catch (e) {
        console.error("❌ createMessage: failed to compute next message_id:", e?.message || e);
      }

      // Petit retry en cas de course (si une contrainte unique existe)
      let lastErr = error;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await db.query(
            `INSERT INTO funquiz_messages (
               message_id, user_id, admin_id, name, email, subject, content, content_admin, priority, status, assigned_to
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [message_id, ...values],
          );
          return {
            message_id,
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
        } catch (e) {
          lastErr = e;
          const errText = String(e?.sqlMessage || e?.message || "");
          const mightBeDuplicate = e?.code === "ER_DUP_ENTRY" || /duplicate/i.test(errText);
          if (!mightBeDuplicate) throw e;

          try {
            const [rows] = await db.query(
              "SELECT COALESCE(MAX(message_id), 0) + 1 AS next_id FROM funquiz_messages",
            );
            message_id = Number(rows?.[0]?.next_id) || message_id + 1;
          } catch {
            message_id++;
          }
        }
      }

      // Si on arrive ici, on laisse remonter la dernière erreur
      throw lastErr;
    }
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
