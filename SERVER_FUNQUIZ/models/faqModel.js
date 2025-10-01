import db from "../config/db.js";

// =============================================================================
// FONCTIONS FAQ - DONNÉES COMPLÈTES
// =============================================================================

export const getAllFaqData = async () => {
    try {   
    const [rows] = await db.query('SELECT * FROM funquiz_faq ');
    return rows;
    } catch (error) {
        console.error('❌ getAllFaqData:', error);
        throw new Error('Erreur lors de la récupération des FAQ.');
    }        
}
    
export const getFaqById = async (faq_id) => {
    try{ 
    const [rows] = await db.query('SELECT * FROM funquiz_faq WHERE faq_id = ?', [faq_id]);
    return rows[0] ? [rows[0]] : [];
    } catch (error) {
        console.error('❌ getFaqById:', error);
        throw new Error('Erreur lors de la récupération de la FAQ.');
    }
}

export const createFaq = async (data) => {
  try {
    const { question, answer, is_active = 1 } = data; // destructuring + valeur par défaut

    const [result] = await db.query(
      `INSERT INTO funquiz_faq (question, answer, is_active) VALUES (?, ?, ?)`,
      [question, answer, is_active]
    );

    return { 
      faq_id: result.insertId, 
      question, 
      answer, 
      is_active 
    };
  } catch (error) {
    console.error("❌ createFaq error:", error);
    throw error;
  }
};

export const updateFaq = async (faq_id, data) => {
  try {
    if (!faq_id) {
      throw new Error("faq_id requis.");
    }

    const { question, answer, is_active } = data;

    // Construire dynamiquement la requête SQL
    const fields = [];
    const values = [];

    if (question !== undefined) {
      fields.push("question = ?");
      values.push(question);
    }
    if (answer !== undefined) {
      fields.push("answer = ?");
      values.push(answer);
    }
    if (is_active !== undefined) {
      fields.push("is_active = ?");
      values.push(is_active);
    }

    if (fields.length === 0) {
      throw new Error("Aucun champ à mettre à jour.");
    }

    values.push(Number(faq_id)); // sécuriser le type

    const sql = `UPDATE funquiz_faq SET ${fields.join(", ")} WHERE faq_id = ?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      throw new Error("FAQ non trouvée.");
    }

    // Retourne uniquement les champs réellement mis à jour
    const updatedFields = { faq_id: Number(faq_id) };
    if (question !== undefined) updatedFields.question = question;
    if (answer !== undefined) updatedFields.answer = answer;
    if (is_active !== undefined) updatedFields.is_active = is_active;

    return updatedFields;
  } catch (error) {
    console.error("❌ updateFaq error:", error);
    throw error;
  }
};

export const deleteFaq = async (faq_id) => {
  try {
    if (!faq_id) {
      throw new Error("faq_id requis.");
    }

    const [result] = await db.query("DELETE FROM funquiz_faq WHERE faq_id = ?", [faq_id]);

    if (result.affectedRows === 0) {
      throw new Error("FAQ non trouvée.");
    }

    return { message: "FAQ supprimée avec succès." };
  } catch (error) {
    console.error("❌ deleteFaq error:", error);
    throw error;
  }
};
  
