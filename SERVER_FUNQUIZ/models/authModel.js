import db from "../config/db.js";
import bcrypt from "bcrypt";

// -----------------------------
// 1️⃣ Recherche
// -----------------------------
export const getUserById = async (user_id) => {
  const [rows] = await db.query(
    "SELECT * FROM funquiz_users WHERE user_id = ?",
    [user_id],
  );
  return rows[0] ? [rows[0]] : [];
};

// -----------------------------
// 1️⃣ Récupérer tous les utilisateurs
// -----------------------------
export const getAllUsers = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM funquiz_users ");
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

    // 🧂 Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 🕓 Date actuelle (inscription et première connexion)
    const now = new Date();

    // 💾 Insertion dans la base avec date_cx
    const [result] = await db.query(
      `INSERT INTO funquiz_users 
      (name, first_name, email, number, password_hash, google_id, avatar_url, role, date_cx)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        first_name,
        email,
        number,
        password_hash,
        google_id || null,
        avatar_url || null,
        role || "user",
        now,
      ],
    );

    // 🧾 Retour de l'utilisateur créé
    return {
      user_id: result.insertId,
      name,
      first_name,
      email,
      number,
      google_id,
      avatar_url,
      role: role || "user",
      date_cx: now,
    };
  } catch (error) {
    console.error("❌ registerUser:", error);
    throw new Error("Erreur lors de l’inscription.");
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

    if (Number(user.is_active) === 0) {
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

  // Sinon créer un utilisateur Google
  const [result] = await db.query(
    `INSERT INTO funquiz_users (google_id, email, name, first_name, avatar_url, number, date_cx) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [google_id, email, name, first_name, avatar_url || null, 0, now],
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

    Object.keys(fields).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
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
    throw new Error(error.message);
  }
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

// Création du feedback
export const createFeedback = async ({ user_id, reason, comment }) => {
  try {
    await db.query(
      "INSERT INTO user_feedbacks (user_id, reason, comment) VALUES (?, ?, ?)",
      [user_id, reason, comment],
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
