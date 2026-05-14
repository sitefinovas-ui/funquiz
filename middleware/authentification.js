import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUserById } from "../models/authModel.js";
import { getPermissionsByRole } from "../models/permissionModel.js";
import db from "../config/db.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "votre_clé_secrète";

/**
 * ✅ Middleware d'authentification via JWT
 */
export const authenticateToken = async (req, res, next) => {
  try {
    console.log("🔐 [Auth] Headers reçus:", req.headers);
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("❌ [Auth] Token manquant");
      return res.status(401).json({ error: "Token manquant" });
    }

    console.log("🔑 [Auth] Vérification du token...");

    // Vérifie le token JWT
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          console.error("❌ [Auth] Token invalide:", err.message);
          return reject(err);
        }
        resolve(decoded);
      });
    });

    if (!decoded || !decoded.user_id) {
      throw new Error("Token invalide : user_id manquant");
    }

    console.log("✅ [Auth] Token décodé:", decoded);

    // Recherche de l'utilisateur dans la BDD
    const [user] = await getUserById(decoded.user_id);
    if (!user) {
      console.error("❌ [Auth] Utilisateur non trouvé:", decoded.user_id);
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    console.log("👤 [Auth] Utilisateur trouvé:", user.user_id);

    // Récupération des points
    let userPoints = 0;
    try {
      const [pointsRows] = await db.query(
        "SELECT total_points FROM user_points WHERE user_id = ?",
        [user.user_id]
      );
      userPoints = pointsRows[0]?.total_points || 0;
    } catch (err) {
      console.error("⚠️ [Auth] Erreur récupération points:", err.message);
    }

    // Injection dans req.user
    req.user = { ...user, points: userPoints };

    next();
  } catch (error) {
    console.error("❌ [Auth] Erreur:", error.message);
    res.status(403).json({ error: "Token invalide ou expiré" });
  }
};

/**
 * ✅ Middleware d’autorisation selon le rôle
 * @param {Array} roles - Ex: ['admin', 'moderator']
 */
export const authorizeRole = (roles = []) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: "Accès refusé" });
  }
  next();
};

/**
 * ✅ Middleware de vérification des permissions granulaires
 * @param {string} permission - Ex: 'users_edit'
 */
export const hasPermission = (permission) => async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role === 'admin') return next(); // L'admin a toujours tous les droits

    const permissions = await getPermissionsByRole(role);
    if (!permissions || !permissions[permission]) {
      return res.status(403).json({ error: `Permission refusée : ${permission}` });
    }
    next();
  } catch (error) {
    console.error("❌ [Permission] Erreur:", error.message);
    res.status(500).json({ error: "Erreur lors de la vérification des permissions" });
  }
};
