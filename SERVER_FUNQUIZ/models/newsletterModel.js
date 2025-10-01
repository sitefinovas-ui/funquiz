import db from "../config/db.js";

//====================================================
// FONCTIONS NEWSLETTER
//====================================================

// Récupérer toutes les newsletters
export const getAllNewsletter = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM funquiz_newsletter');
    return rows;
  } catch (error) {
    throw error;
  }
};

// Récupérer une newsletter par ID
export const getNewsletterById = async (id) => {
  try {
    const [rows] = await db.query('SELECT * FROM funquiz_newsletter WHERE newsletter_id = ?', [id]);
    return rows[0] ? [rows[0]] : [];
  } catch (error) {
    throw error;
  }
};

// Créer un nouvel abonnement
export const createNewsletter = async (newsletterData) => {
  try {
    const { email, user_id = null } = newsletterData;

    const [result] = await db.query(
      `INSERT INTO funquiz_newsletter (email, user_id) VALUES (?, ?)`,
      [email, user_id]
    );

    return { 
      id: result.insertId,
      email,
      user_id,
      confirmed: 0
    };
  } catch (error) {
    throw error;
  }
};

// Supprimer un abonnement
export const deleteNewsletter = async (id) => {
  try {
    const [result] = await db.query('DELETE FROM funquiz_newsletter WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};
