// Top-level imports et suppression de l'init locale
import {
  registerUser,
  loginUser,
  getAllUsers,
  requestPasswordReset,
  registerOrLoginGoogleUser,
  resetPassword,
  deleteUserSoft,
  updateUserFile,
  getUserFile,
  updateUserFields,
  getUserById,
  createFeedback,
  findByNumber,
  updateResetCode,
  verifyResetCode,
  setUserVerified,
  findUserByEmail,
  insertUserBasic,
} from "../models/authModel.js";
import pkg from "whatsapp-web.js";
import xlsx from "xlsx";

import qrcode from "qrcode-terminal";
import dotenv from "dotenv";
import {
  mailInscription,
  mailConnected,
  sendResetCodeEmail,
  mailAccountDeleted,
  mailUpdateProfile,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import path from "path";
import fs from "fs"; // si tu supprimes des fichiers

import { waClient, ensureWhatsAppReady, ensureWhatsAppConnected } from "../utils/whatsapp.js";

dotenv.config();
const { Client, LocalAuth } = pkg;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;
const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES);

// --- Helpers
function generateOTP(length = 6) {
  const digits = "0703562459";
  return Array.from(
    { length },
    () => digits[Math.floor(Math.random() * digits.length)],
  ).join("");
}

function formatWhatsAppId(number) {
  return `${number}@c.us`;
}

// Retourne l'utilisateur courant à partir du token (pour /auth/me)
export const me = (req, res) => {
  res.status(200).json(req.user);
};
// -----------------------------
// 1️⃣ Récupérer tous les utilisateurs
// -----------
export const allUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------
// 2️⃣ Inscription
// -----------------------------
export const signup = async (req, res) => {
  try {
    // Enregistre l'utilisateur
    const user = await registerUser(req.body);

    // Envoie un mail de bienvenue
    await mailInscription(user.email, user.first_name);

    // Crée un token JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        avatar: user.avatar_url,
        number: user.number,
        name: user.name,
        firstname: user.first_name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "3d" },    );

    res.status(201).json({
      message: "Utilisateur inscrit",
      token,
      user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------
// 3️⃣ Connexion
// -----------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user;
    try {
      user = await loginUser(email, password);
    } catch (err) {
      const code = err.code || "";
      // Codes précis -> statuts et messages clairs
      if (code === "INVALID_PASSWORD") {
        return res.status(401).json({
          message: "Mot de passe incorrect",
          code,
          type: "erreur",
        });
      }
      if (code === "USER_NOT_FOUND") {
        return res.status(404).json({
          message: "Utilisateur non trouvé",
          code,
          type: "erreur",
        });
      }
      if (code === "ACCOUNT_INACTIVE") {
        return res.status(403).json({
          message:
            "Veuillez contacter le support : votre compte est inactif. Impossible de se connecter.",
          code,
          type: "erreur",
        });
      }
      // Fallback si pas de code
      return res.status(400).json({
        message: err.message || "Erreur de connexion",
        code: code || "UNKNOWN_ERROR",
        type: "erreur",
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        avatar: user.avatar_url,
        number: user.number,
        name: user.name,
        firstname: user.first_name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "3d" },    );

    await mailConnected(user.email, user.first_name, req.ip);

    res.status(200).json({
      message: "Connexion réussie",
      type: "succès",
      token,
      user: { user_id: user.user_id },
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      type: "erreur",
      code: "LOGIN_CONTROLLER_ERROR",
    });
  }
};

// -----------------------------
// 3️⃣ Connexion/inscription google
// -----------------------------
export const googleAuth = async (req, res) => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: "GOOGLE_CLIENT_ID manquant côté serveur" });
    }
    const { token } = req.body;

    // Vérifier le token Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, given_name, picture } = payload;

    // Crée ou récupère l'utilisateur Google
    const user = await registerOrLoginGoogleUser({
      google_id: sub,
      email,
      name,
      first_name: given_name,
      avatar_url: picture,
    });

    // Générer JWT
    const jwtToken = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        avatar: user.avatar_url,
        name: user.name,
        firstname: user.first_name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "3d" },
    );

    // Réponse
    res.status(200).json({
      message: "Connexion / Inscription Google réussie",
      token: jwtToken,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar_url,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------
// 4️⃣ Demande réinitialisation mot de passe
// -----------------------------
export const requestResetPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const resetCode = await requestPasswordReset(email);
    await sendResetCodeEmail(email, "", resetCode);
    res
      .status(200)
      .json({ message: "Code de réinitialisation envoyé par mail" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------
// 5️⃣ Réinitialisation mot de passe
// -----------------------------
export const resetUserPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;
    await resetPassword(code, newPassword);
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------
// 6️⃣ Modifier un champ utilisateur
// -----------------------------

// -----------------------------
// Mise à jour simple (user)
// -----------------------------
export const updateUserProfile = async (req, res) => {
  try {
    const { user_id, ...fields } = req.body;
    if (!user_id) throw new Error("user_id requis");

    const allowedFields = [
      "name",
      "first_name",
      "email",
      "number",
      "avatar_url",
    ];
    const updatedUser = await updateUserFields(user_id, fields, allowedFields);

    try {
      await mailUpdateProfile(updatedUser.email, updatedUser.first_name);
    } catch (e) {
      console.error("❌ Erreur mailUpdateProfile:", e);
    }
    res.status(200).json({ message: "Profil mis à jour", user: updatedUser });
  } catch (error) {
    console.error("❌ updateUserProfile:", error);
    // Conflit d'unicité sur number -> 409
    if (
      error?.code === "NUMBER_ALREADY_IN_USE" ||
      /Duplicate entry/.test(error?.message || "")
    ) {
      return res.status(409).json({
        message: "Ce numéro est déjà utilisé par un autre compte.",
        code: "NUMBER_ALREADY_IN_USE",
        type: "erreur",
      });
    }
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------
// Mise à jour admin (tous les champs)
// -----------------------------
export const updateUserAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Action réservée aux administrateurs." });
    }
    const { user_id, ...fields } = req.body;
    if (!user_id) throw new Error("user_id requis");

    const allowedFields = [
      "name",
      "first_name",
      "email",
      "number",
      "avatar_url",
      "role",
      "status",
      "is_active",
    ];
    const invalidFields = Object.keys(fields).filter(
      (field) => !allowedFields.includes(field),
    );
    if (invalidFields.length > 0) {
      throw new Error(`Champs invalides : ${invalidFields.join(", ")}`);
    }

    if (fields.is_active !== undefined) {
      fields.is_active = Number(fields.is_active) ? 1 : 0;
    }
    if (
      fields.status &&
      !["active", "suspended", "deleted"].includes(fields.status)
    ) {
      fields.status = "active";
    }

    const updatedUser = await updateUserFields(user_id, fields, allowedFields);

    const notifyFields = [
      "name",
      "first_name",
      "email",
      "number",
      "avatar_url",
    ];
    const shouldNotify = Object.keys(fields).some((f) =>
      notifyFields.includes(f),
    );
    if (shouldNotify) {
      try {
        await mailUpdateProfile(updatedUser.email, updatedUser.first_name);
      } catch (e) {
        console.error("❌ Erreur mailUpdateProfile:", e);
      }
    }
    res
      .status(200)
      .json({ message: "Utilisateur mis à jour (admin)", user: updatedUser });
  } catch (error) {
    console.error("❌ updateUserAdmin:", error);
    if (
      error?.code === "NUMBER_ALREADY_IN_USE" ||
      /Duplicate entry/.test(error?.message || "")
    ) {
      return res.status(409).json({
        message: "Ce numéro est déjà utilisé par un autre compte.",
        code: "NUMBER_ALREADY_IN_USE",
        type: "erreur",
      });
    }
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------
// 7️⃣ Suppression soft
// -----------------------------
export const deleteUserWithFeedback = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Action réservée aux administrateurs." });
    }

    const { user_id, reason, comment } = req.body;

    if (!reason)
      return res.status(400).json({ error: "La raison est obligatoire" });

    // 1️⃣ Enregistrer le feedback
    await createFeedback({ user_id, reason, comment });

    // 2️⃣ Supprimer l'utilisateur (soft delete)
    await deleteUserSoft(user_id);

    res
      .status(200)
      .json({
        message: "Votre compte a été supprimé et votre feedback enregistré.",
      });
  } catch (error) {
    console.error("❌ deleteUserWithFeedback:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload avatar
export const uploadUserFile = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) throw new Error("user_id requis");
    if (!req.file) throw new Error("Aucun fichier envoyé");

    // Chemin du nouveau fichier sauvegardé
    const filePath = `/uploads/users/${req.file.filename}`;

    // Supprimer ancien fichier si existant
    const oldFile = await getUserFile(user_id);
    if (oldFile && oldFile.startsWith("/uploads/users")) {
      const oldPath = path.join("uploads/users", path.basename(oldFile)); // chemin réel
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Mettre à jour la BDD
    await updateUserFile(user_id, filePath);

    // Répondre avec l'URL complète
    const avatarUrl = `http://${process.env.IP}:${process.env.PORT}${filePath}`;
    res
      .status(200)
      .json({ message: "Fichier uploadé avec succès", avatar_url: avatarUrl });
  } catch (error) {
    console.error("❌ uploadUserFile:", error);
    res.status(400).json({ error: error.message });
  }
};
// Supprimer avatar
export const deleteUserFile = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) throw new Error("user_id requis");

    // Récupérer le chemin du fichier dans la BDD
    const [user] = await getUserById(user_id); // créer cette fonction dans le modèle
    if (!user || !user.avatar_url) throw new Error("Aucun fichier à supprimer");

    const filePath = path.join(process.cwd(), user.avatar_url);

    // Supprimer le fichier physiquement
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Mettre à jour la BDD
    const updatedUser = await updateUserFields(user_id, { avatar_url: null }, [
      "avatar_url",
    ]);

    res
      .status(200)
      .json({
        message: "Fichier supprimé et BDD mise à jour",
        user: updatedUser,
      });
  } catch (error) {
    console.error("❌ deleteUserFile:", error);
    res.status(400).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  try {
    // Suppression sécurisée du cookie "token"
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, // true si HTTPS
      sameSite: "None", // permet le partage du cookie entre domaines (backend/frontend)
    });

    console.log("✅ Déconnexion réussie");

    // NE PAS rediriger côté backend avec 2 services séparés
    // Renvoyer un JSON à la place
    return res.status(200).json({ 
      success: true, 
      message: "Déconnexion réussie" 
    });
    
  } catch (error) {
    console.error("❌ Erreur lors de la déconnexion :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la déconnexion." 
    });
  }
};

// -----------------------------
// 8️⃣ Récupérer les points d'un utilisateur
// -----------------------------
export const getUserPoints = async (req, res) => {
  try {
    const user_id = req.params.id;
    if (!user_id) return res.status(400).json({ error: "user_id requis" });
    const [rows] = await import("../config/db.js").then((m) =>
      m.default.query(
        "SELECT total_points FROM user_points WHERE user_id = ?",
        [user_id],
      ),
    );
    if (!rows[0])
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.status(200).json({ user_id, total_points: rows[0].total_points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Controllers
export async function sendOtp(req, res) {
  try {
    const { number } = req.body;
    if (!number) return res.status(400).json({ error: "number requis" });

    const user = await findByNumber(number);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const otp = generateOTP(6);
    const expiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    await updateResetCode(user.user_id, otp, expiry);

    const message = `
        Bonjour ${user.first_name || user.name || ""} 👋,
        🔑 Code OTP : ${otp}
        ⏰ Valable ${OTP_TTL_MINUTES} minutes.
    `;

    try {
      await ensureWhatsAppReady();
      await ensureWhatsAppConnected(); // état strict CONNECTED
    } catch (e) {
      return res.status(503).json({ error: "WhatsApp non prêt", details: e.message });
    }

    const numberId = await waClient.getNumberId(String(number)).catch(() => null);
    if (!numberId || !numberId._serialized) {
      return res.status(400).json({ error: "Numéro WhatsApp invalide ou non trouvable" });
    }

    const sendResult = await waClient.sendMessage(numberId._serialized, message);

    return res.json({
      success: true,
      message: "OTP envoyé via WhatsApp.",
      waStatus: sendResult?.id || null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { number, code } = req.body;
    if (!number || !code)
      return res.status(400).json({ error: "number et code requis" });

    const found = await verifyResetCode(number, code);
    if (!found)
      return res
        .status(400)
        .json({ success: false, message: "Code invalide ou expiré" });

    await updateResetCode(found.user_id, null, null);

    await setUserVerified(found.user_id);

    return res.json({ success: true, message: "OTP vérifié" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Erreur serveur", details: err.message });
  }
}

export const importUsers = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Aucun fichier envoyé" });

    const { mimetype, buffer } = req.file;
    let rows = [];

    const splitLine = (line, sep) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === sep && !inQuotes) {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current);
      return result.map((c) => c.replace(/^"(.*)"$/, "$1"));
    };

    if (
      mimetype === "text/csv" ||
      mimetype === "application/vnd.ms-excel" ||
      mimetype === "text/plain" ||
      mimetype === "application/octet-stream" ||
      mimetype === "text/tab-separated-values"
    ) {
      let content = buffer.toString("utf-8").replace(/^\uFEFF/, "");
      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (!lines.length) return res.status(400).json({ error: "Fichier vide" });

      const sep = lines[0].includes(";")
        ? ";"
        : lines[0].includes("\t")
          ? "\t"
          : ",";
      rows = lines.map((l) => splitLine(l, sep));
    } else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const wb = xlsx.read(buffer, { type: "buffer" });
      const sheetName = wb.SheetNames[0];
      rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
    } else {
      return res.status(400).json({ error: "Type de fichier non supporté" });
    }

    if (!rows.length) return res.status(400).json({ error: "Fichier vide" });

    const [headers, ...data] = rows;
    const normalizedHeaders = headers.map((h) =>
      String(h || "")
        .replace(/\uFEFF/g, "")
        .trim()
        .toLowerCase(),
    );

    const headerMap = {
      prenom: ["prenom", "prénom", "first_name", "firstname"],
      nom: ["nom", "name", "last_name", "lastname"],
      email: ["email", "mail", "e-mail"],
      role: ["role", "rôle"],
    };

    const idx = {};
    for (const key of Object.keys(headerMap)) {
      const found = normalizedHeaders.findIndex((h) =>
        headerMap[key].includes(h),
      );
      idx[key] = found;
    }

    const missing = Object.entries(idx)
      .filter(([, i]) => i === -1)
      .map(([k]) => k);
    if (missing.length) {
      return res.status(400).json({
        error: `En-têtes invalides ou manquants: ${missing.join(", ")}. Attendus: Prenom, Nom, Email, Role`,
        details: { normalizedHeaders },
      });
    }

    const users = data
      .map((row) => ({
        first_name: row[idx.prenom]?.toString().trim(),
        name: row[idx.nom]?.toString().trim(),
        email: row[idx.email]?.toString().trim(),
        role: (row[idx.role]?.toString().trim() || "user").toLowerCase(),
      }))
      .filter((u) => u.email);

    // Lire les paramètres par défaut envoyés par le front
    const defaultIsActiveRaw = req.body?.default_is_active;
    const defaultStatusRaw = (req.body?.default_status || "").toLowerCase();
    const validStatuses = ["active", "suspended", "deleted"];
    const isActiveDefault =
      defaultIsActiveRaw !== undefined
        ? Number(defaultIsActiveRaw)
          ? 1
          : 0
        : 1;
    const statusDefault = validStatuses.includes(defaultStatusRaw)
      ? defaultStatusRaw
      : "active";

    // Insertion en base avec les champs demandés
    const results = { inserted: 0, duplicates: [], errors: [] };
    const validRoles = ["user", "admin", "moderator"];

    for (const u of users) {
      try {
        if (!u.first_name || !u.name || !u.email) {
          results.errors.push({
            email: u.email || "(vide)",
            error: "Champs requis manquants",
          });
          continue;
        }
        const existing = await findUserByEmail(u.email);
        if (existing) {
          results.duplicates.push(u.email);
          continue;
        }
        const payload = {
          first_name: u.first_name,
          name: u.name,
          email: u.email,
          role: validRoles.includes(u.role) ? u.role : "user",
          is_active: isActiveDefault,
          status: statusDefault,
        };
        await insertUserBasic(payload);
        results.inserted++;
      } catch (e) {
        results.errors.push({ email: u.email, error: e.message });
      }
    }

    return res.status(200).json({
      message: `Import terminé: ${results.inserted} inséré(s), ${results.duplicates.length} doublon(s), ${results.errors.length} erreur(s).`,
      count: users.length,
      inserted: results.inserted,
      duplicates: results.duplicates,
      errors: results.errors,
      preview: users.slice(0, 5),
    });
  } catch (error) {
    console.error("❌ importUsers:", error);
    return res.status(500).json({ error: error.message });
  }
};
