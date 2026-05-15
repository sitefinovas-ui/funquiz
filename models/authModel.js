import db from "../config/db.js";
import bcrypt from "bcrypt";

// -----------------------------
// 1️⃣ Recherche
// -----------------------------
const SAFE_USER_FIELDS = `user_id, name, first_name, email, number, avatar_url, role, is_active, date_cx, google_id, preferences`;

export const getUserById = async (user_id) => {
  const [rows] = await db.query(
    `SELECT ${SAFE_USER_FIELDS} FROM funquiz_users WHERE user_id = ?`,
    [user_id],
  );
  return rows[0] ? [rows[0]] : [];
};

// -----------------------------
// 1️⃣ Récupérer tous les utilisateurs
// -----------------------------
export const getAllUsers = async () => {
  try {
    const [rows] = await db.query(`
      SELECT u.user_id, u.name, u.first_name, u.email, u.number, u.avatar_url, u.role, u.is_active, u.date_cx, u.google_id, u.preferences,
      (SELECT COUNT(*) FROM quiz_game_history h WHERE h.user_id = u.user_id) as quiz_completed
      FROM funquiz_users u
    `);
    return rows;
  } catch (error) {
    console.error("❌ getAllUsers:", error);
    throw new Error("Erreur lors de la récupération des utilisateurs.");
  }
};

// -----------------------------
// 2️⃣ Inscription
// -----------------------------
export const registerUser = async (data) => {
  try {
    const {
      name,
      first_name,
      email,
      number,
      password,
      google_id,
      avatar_url,
      role,
    } = data;

    // 🔐 Validation minimale (évite les users bancals)
    if (!email || !name || !first_name) {
      throw new Error("Champs obligatoires manquants");
    }

    // 🧂 Hash du mot de passe (si fourni)
    let password_hash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(password, salt);
    }

    // 🕓 Date actuelle
    const now = new Date();

    // 💾 INSERT (AUTO_INCREMENT uniquement)
    const [result] = await db.query(
      `INSERT INTO funquiz_users 
      (
        name,
        first_name,
        email,
        number,
        password_hash,
        google_id,
        avatar_url,
        role,
        is_active,
        date_cx
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        first_name,
        email,
        number || null,
        password_hash,
        google_id || null,
        avatar_url || null,
        "user",
        1,
        now,
      ],
    );

    // 🧾 ID fiable MySQL
    const user_id = result.insertId;

    if (!user_id) {
      throw new Error("Impossible de récupérer l'user_id (insertId vide)");
    }

    // 📦 retour propre
    return {
      user_id,
      name,
      first_name,
      email,
      number,
      google_id,
      avatar_url,
      role: role || "user",
      is_active: 1,
      date_cx: now,
    };

  } catch (error) {
    console.error("❌ registerUser:", error);
    throw new Error(error.message || "Erreur lors de l’inscription.");
  }
};
// -----------------------------
// 3️⃣ Connexion
// -----------------------------
export const loginUser = async (email, password) => {
  try {
    // 1️⃣ Vérifier l'existence de l'utilisateur
    const [rows] = await db.query(
      "SELECT * FROM funquiz_users WHERE email = ?",
      [email],
    );
    if (!rows[0]) {
      const err = new Error("Utilisateur non trouvé");
      err.code = "USER_NOT_FOUND";
      throw err;
    }
    
    const user = rows[0];

    // 2️⃣ Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error("Mot de passe incorrect");
      err.code = "INVALID_PASSWORD";
      throw err;
    }

    const isInactive =
      user.is_active !== undefined &&
      user.is_active !== null &&
      Number(user.is_active) === 0;
    if (isInactive) {
      const err = new Error(
        "Veuillez contacter le support : votre compte est inactif. Impossible de se connecter."
      );
      err.code = "ACCOUNT_INACTIVE";
      throw err;
    }

    // 3️⃣ Mettre à jour la date de connexion (date_cx)
    const now = new Date();
    await db.query("UPDATE funquiz_users SET date_cx = ? WHERE user_id = ?", [
      now,
      user.user_id,
    ]);

    // 4️⃣ Retourner l'utilisateur avec la date de connexion mise à jour
    return { ...user, date_cx: now };
  } catch (error) {
    console.error("❌ loginUser:", error);
    throw new Error(error.message);
  }
};

// -----------------------------
// 4️⃣ Inscription / connexion Google
// -----------------------------
export const registerOrLoginGoogleUser = async ({
  google_id,
  email,
  name,
  first_name,
  avatar_url,
}) => {
  // Vérifie si l'utilisateur existe
  const [rows] = await db.query(
    "SELECT * FROM funquiz_users WHERE email = ? OR google_id = ?",
    [email, google_id],
  );

  const now = new Date();

  if (rows[0]) {
    // 🟢 Mise à jour de la date de connexion
    await db.query("UPDATE funquiz_users SET date_cx = ? WHERE user_id = ?", [
      now,
      rows[0].user_id,
    ]);
    return { ...rows[0], date_cx: now };
  }

  // Crée un utilisateur Google sans numéro; l’utilisateur l’ajoutera ensuite dans son profil
  const [result] = await db.query(
    `INSERT INTO funquiz_users (user_id, google_id, email, name, first_name, avatar_url, number, is_active, date_cx) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number((await db.query("SELECT COALESCE(MAX(user_id), 0) + 1 AS next_id FROM funquiz_users"))[0][0]?.next_id) || 1,
      google_id,
      email,
      name,
      first_name,
      avatar_url || null,
      null,
      1,
      now
    ],
  );

  return {
    user_id: result.insertId,
    google_id,
    email,
    name,
    first_name,
    avatar_url,
    date_cx: now,
  };
};

// -----------------------------
// 4️⃣ Demande réinitialisation mot de passe
// -----------------------------
export const requestPasswordReset = async (email) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM funquiz_users WHERE email = ?",
      [email],
    );
    if (!rows[0]) throw new Error("Utilisateur non trouvé");

    const resetCode = Math.floor(10000000 + Math.random() * 90000000); // code 8 chiffres
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.query(
      "UPDATE funquiz_users SET reset_code = ?, reset_expiry = ? WHERE email = ?",
      [resetCode, expiresAt, email],
    );

    return resetCode;
  } catch (error) {
    console.error("❌ requestPasswordReset:", error);
    throw new Error(error.message);
  }
};

// -----------------------------
// 5️⃣ Réinitialiser le mot de passe
// ----------------------------------
export const resetPassword = async (code, newPassword) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM funquiz_users WHERE reset_code = ? AND reset_expiry > NOW()",
      [code],
    );
    if (!rows[0]) throw new Error("Code invalide ou expiré");

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await db.query(
      "UPDATE funquiz_users SET password_hash = ?, reset_code = NULL, reset_expiry = NULL WHERE reset_code = ?",
      [password_hash, code],
    );

    return true;
  } catch (error) {
    console.error("❌ resetPassword:", error);
    throw new Error(error.message);
  }
};
// -----------------------------
// 6️⃣ Modifier un champ utilisateur
// -----------------------------
export const updateUserFields = async (user_id, fields, allowedFields) => {
  try {
    const updates = [];
    const values = [];

    // Pré-check unicité pour le champ number
    if (fields.number !== undefined) {
      // Autoriser explicitement null/"" pour effacer le numéro
      if (fields.number === "" || fields.number === null) {
        fields.number = null;
      } else {
        // Vérifier si ce number est déjà utilisé par un autre user
        const [dup] = await db.query(
          "SELECT user_id FROM funquiz_users WHERE number = ? AND user_id != ?",
          [fields.number, user_id]
        );
        if (dup[0]) {
          console.error(`❌ Duplicate number ${fields.number} found for user_id ${dup[0].user_id} (current user: ${user_id})`);
          const err = new Error("Ce numéro est déjà utilisé par un autre compte.");
          err.code = "NUMBER_ALREADY_IN_USE";
          throw err;
        }
      }
    }

    Object.keys(fields).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        let val = fields[key];
        // Si c'est un objet (pour preferences), on le stringify pour MySQL
        if (key === 'preferences' && typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        values.push(val);
      }
    });

    if (updates.length === 0)
      throw new Error("Aucun champ autorisé à mettre à jour");

    values.push(user_id);
    const sql = `UPDATE funquiz_users SET ${updates.join(", ")} WHERE user_id = ?`;
    await db.query(sql, values);

    const [rows] = await db.query(
      "SELECT * FROM funquiz_users WHERE user_id = ?",
      [user_id],
    );
    return rows[0];
  } catch (error) {
    console.error("❌ updateUserFields:", error);
    // Si la base renvoie quand même un doublon (course), normaliser le code
    if (error.code === "ER_DUP_ENTRY") {
      const err = new Error("Ce numéro est déjà utilisé par un autre compte.");
      err.code = "NUMBER_ALREADY_IN_USE";
      throw err;
    }
    // Préserver le code applicatif si présent
    throw error;
  }
  throw new Error(error.message);
};
// -----------------------------
// 7️⃣ Suppression soft
// -----------------------------
export const deleteUserSoft = async (user_id) => {
  try {
    await db.query(
      'UPDATE funquiz_users SET status = "deleted" WHERE user_id = ?',
      [user_id],
    );
    return true;
  } catch (error) {
    console.error("❌ deleteUserSoft:", error);
    throw new Error(error.message);
  }
};

// -----------------------------
// 7️⃣ bis Suppression DEFINITIVE (Hard Delete) - Temporaire
// -----------------------------
export const deleteUserHard = async (user_id) => {
  try {
    await db.query('DELETE FROM funquiz_users WHERE user_id = ?', [user_id]);
    return true;
  } catch (error) {
    console.error("❌ deleteUserHard:", error);
    throw new Error(error.message);
  }
};

// Création du feedback
export const createFeedback = async ({ user_id, reason, comment }) => {
  try {
    // Génère un id si la colonne n'est pas AUTO_INCREMENT
    const [rows] = await db.query(
      "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM user_feedbacks"
    );
    const next_id = Number(rows?.[0]?.next_id) || 1;

    await db.query(
      "INSERT INTO user_feedbacks (id, user_id, reason, comment) VALUES (?, ?, ?, ?)",
      [next_id, user_id, reason, comment],
    );
    console.log("✅ Feedback créé avec succès", { user_id, reason, comment });
    return true;
  } catch (error) {
    console.error("❌ createFeedback:", error);
    throw new Error(error.message);
  }
};

// Met à jour le chemin du fichier pour l'utilisateur
export const updateUserFile = async (user_id, filePath) => {
  try {
    const [rows] = await db.query(
      "UPDATE funquiz_users SET avatar_url = ? WHERE user_id = ?",
      [filePath, user_id],
    );
    return rows;
  } catch (error) {
    console.error("❌ updateUserFile:", error);
    throw error;
  }
};

// Récupère le chemin du fichier actuel de l'utilisateur
export const getUserFile = async (user_id) => {
  try {
    const [rows] = await db.query(
      "SELECT avatar_url FROM funquiz_users WHERE user_id = ?",
      [user_id],
    );
    return rows[0]?.avatar_url || null;
  } catch (error) {
    console.error("❌ getUserFile:", error);
    throw error;
  }
};

export const findUserByEmail = async (email) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM funquiz_users WHERE email = ?",
      [email],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("❌ findUserByEmail:", error);
    throw new Error(error.message);
  }
};

export const insertUserBasic = async (data) => {
  try {
    const { name, first_name, email, is_active, status, role } = data;
    const [result] = await db.query(
      `INSERT INTO funquiz_users (name, first_name, email, is_active, status, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, first_name, email, Number(is_active) ? 1 : 0, status, role],
    );
    return { user_id: result.insertId };
  } catch (error) {
    console.error("❌ insertUserBasic:", error);
    throw new Error("Erreur lors de l'insertion (import).");
  }
};

export const findByNumber = async (number) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM funquiz_users WHERE number = ?",
      [number],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("❌ findByNumber:", error);
    throw error;
  }
};

export const updateResetCode = async (user_id, code, expiry) => {
  try {
    const [result] = await db.query(
      "UPDATE funquiz_users SET reset_code = ?, reset_expiry = ? WHERE user_id = ?",
      [code, expiry, user_id],
    );
    return result;
  } catch (error) {
    console.error("❌ updateResetCode:", error);
    throw error;
  }
};

export const verifyResetCode = async (number, code) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM funquiz_users WHERE number = ? AND reset_code = ? AND reset_expiry >= ?",
      [number, code, new Date()],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("❌ verifyResetCode:", error);
    throw error;
  }
};

// Fonction pour mettre is_verify à 1
export const setUserVerified = async (user_id) => {
  try {
    const [result] = await db.query(
      "UPDATE funquiz_users SET is_verify = 1 WHERE user_id = ?",
      [user_id],
    );
    return result;
  } catch (error) {
    console.error("❌ setUserVerified:", error);
    throw error;
  }
};

// fichier: authModel.js

// Génère un numéro utilisateur unique (10 chiffres) et vérifie en base
const generateUniqueUserNumber = async () => {
  for (let i = 0; i < 5; i++) {
    const candidate = String(
      Math.floor(1000000000 + Math.random() * 9000000000)
    ); // 10 chiffres
    const [rows] = await db.query(
      "SELECT user_id FROM funquiz_users WHERE number = ?",
      [candidate]
    );
    if (rows.length === 0) return candidate;
  }
  // Fallback déterministe: 10 derniers chiffres du timestamp
  return String(Date.now()).slice(-10);
};
