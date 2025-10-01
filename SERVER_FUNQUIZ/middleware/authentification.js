
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { getUserById } from '../models/authModel.js';
import db from '../config/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ error: 'Token manquant' });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    // Recharge l'utilisateur depuis la BDD pour avoir les infos à jour
    if (decoded && decoded.user_id) {
      const [user] = await getUserById(decoded.user_id);
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      // Récupère les points depuis la vue user_points
      try {
        const [rows] = await db.query('SELECT total_points FROM user_points WHERE user_id = ?', [user.user_id]);
        user.total_points = rows && rows[0] ? rows[0].total_points : 0;
      } catch (e) {
        user.total_points = 0;
      }
      req.user = user;
    } else {
      req.user = decoded;
    }
    next();
  });
};

export const authorizeRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  next();
};