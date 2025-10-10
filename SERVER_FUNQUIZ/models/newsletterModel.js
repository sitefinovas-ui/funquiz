import db from "../config/db.js";

/* ====================================================
   🔧 Vérification connexion base de données
==================================================== */
const checkDatabaseConnection = async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ [DB] Connexion OK');
  } catch (error) {
    console.error('❌ [DB] Erreur de connexion:', error.message);
    throw new Error('Erreur de connexion à la base de données');
  }
};

/* ====================================================
   📬 Récupérer toutes les newsletters
==================================================== */
export const getAllNewsletter = async () => {
  try {
    await checkDatabaseConnection();
    const [rows] = await db.query(
      "SELECT * FROM funquiz_newsletter ORDER BY created_at DESC"
    );
    console.log(`📊 [Model] ${rows.length} newsletters récupérées`);
    return rows;
  } catch (error) {
    console.error('❌ [Model] Erreur getAllNewsletter:', error.message);
    throw error;
  }
};

/* ====================================================
   🔍 Récupérer une newsletter par ID
==================================================== */
export const getNewsletterById = async (id) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM funquiz_newsletter WHERE newsletter_id = ?",
      [id]
    );
    console.log(
      `📊 [Model] Newsletter ID ${id}: ${rows[0] ? 'trouvée' : 'non trouvée'}`
    );
    return rows[0] || null;
  } catch (error) {
    console.error(`❌ [Model] Erreur getNewsletterById (${id}):`, error.message);
    throw error;
  }
};

/* ====================================================
   ✉️ Rechercher une newsletter par email
==================================================== */
export const findNewsletterByEmail = async (email) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM funquiz_newsletter WHERE LOWER(email) = LOWER(?) LIMIT 1",
      [email]
    );
    console.log(
      `📧 [Model] Recherche email ${email}: ${rows[0] ? 'trouvé' : 'non trouvé'}`
    );
    return rows[0] || null;
  } catch (error) {
    console.error(`❌ [Model] Erreur findNewsletterByEmail (${email}):`, error.message);
    throw error;
  }
};

/* ====================================================
   🆕 Créer un nouvel abonnement
==================================================== */
export const createNewsletter = async (newsletterData) => {
  try {
    const { email, user_id = null } = newsletterData;

    const [result] = await db.query(
      `INSERT INTO funquiz_newsletter (email, user_id, confirmed, created_at)
       VALUES (?, ?, 1, CURRENT_TIMESTAMP)`,
      [email, user_id]
    );

    console.log(`✅ [Model] Newsletter créée (ID: ${result.insertId})`);
    return {
      newsletter_id: result.insertId,
      email,
      user_id,
      confirmed: 1,
      created_at: new Date()
    };
  } catch (error) {
    console.error('❌ [Model] Erreur createNewsletter:', error.message);
    throw error;
  }
};

/* ====================================================
   ⚙️ Mettre à jour le statut confirmed
==================================================== */
export const updateNewsletterStatus = async (id, confirmed) => {
  try {
    const [result] = await db.query(
      "UPDATE funquiz_newsletter SET confirmed = ? WHERE newsletter_id = ?",
      [confirmed, id]
    );
    console.log(
      `📊 [Model] Mise à jour statut (${id}): ${
        result.affectedRows > 0 ? 'OK' : 'échouée'
      }`
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`❌ [Model] Erreur updateNewsletterStatus (${id}):`, error.message);
    throw error;
  }
};

/* ====================================================
   🔎 Recherche avancée avec filtres dynamiques
==================================================== */
export const searchNewsletters = async (filters = {}) => {
  console.log('\n📊 [Model] Début searchNewsletters');
  console.log('📥 [Model] Filtres reçus:', filters);

  try {
    await checkDatabaseConnection();

    let query = "SELECT * FROM funquiz_newsletter";
    const conditions = [];
    const params = [];

    // 🔹 Filtre: confirmed
    if (filters.confirmed !== undefined && filters.confirmed !== null && filters.confirmed !== '') {
      conditions.push("confirmed = ?");
      params.push(Number(filters.confirmed));
    }

    // 🔹 Filtre: email / recherche textuelle
    if (filters.search?.trim()) {
      conditions.push("email LIKE ?");
      params.push(`%${filters.search.trim()}%`);
    }

    // 🔹 Filtre: date début
    if (filters.startDate?.trim()) {
      conditions.push("DATE(created_at) >= ?");
      params.push(filters.startDate);
    }

    // 🔹 Filtre: date fin
    if (filters.endDate?.trim()) {
      conditions.push("DATE(created_at) <= ?");
      params.push(filters.endDate);
    }

    // 🧩 Ajout des conditions si nécessaires
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // 🔽 Tri par date
    query += " ORDER BY created_at DESC";

    console.log('🧠 [Model] SQL générée:', query);
    console.log('📦 [Model] Paramètres:', params);

    const [rows] = await db.query(query, params);

    console.log(`✅ [Model] ${rows.length} résultat(s) trouvé(s)`);

    return {
      success: true,
      count: rows.length,
      results: rows
    };
  } catch (error) {
    console.error('❌ [Model] Erreur searchNewsletters:', error.message);
    throw error;
  }
};

/* ====================================================
   🗑️ Supprimer un abonnement
==================================================== */
export const deleteNewsletter = async (newsletter_id) => {
  try {
    const [result] = await db.query(
      "DELETE FROM funquiz_newsletter WHERE newsletter_id = ?",
      [newsletter_id]
    );
    console.log(
      `🗑️ [Model] Suppression newsletter (${newsletter_id}): ${
        result.affectedRows > 0 ? 'OK' : 'échouée'
      }`
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`❌ [Model] Erreur deleteNewsletter (${newsletter_id}):`, error.message);
    throw error;
  }
};
