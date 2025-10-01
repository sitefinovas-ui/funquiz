import { getUserPoints } from '../controllers/authController.js';

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  signup, 
  login, 
  googleAuth,
  allUsers, 
  requestResetPasswordController, 
  resetUserPassword, 
  updateUserProfile,
  updateUserAdmin, 
  deleteUserWithFeedback,
  uploadUserFile,
  deleteUserFile,
  logout,
  me
} from '../controllers/authController.js';
import { authenticateToken, authorizeRole } from '../middleware/authentification.js';




const router = express.Router();

// =============================
// Authentification & Utilisateur
// =============================
router.post('/auth/signup', signup); // Inscription
router.post('/auth/login', login); // Connexion
router.post('/auth/google', googleAuth); // Connexion Google
router.post('/auth/logout', logout); // Déconnexion
router.get('/auth/me', authenticateToken, me); // Récupérer l'utilisateur courant

// =============================
// Gestion Utilisateurs/Admin
// =============================
router.get('/auth/all', allUsers); // Tous les utilisateurs
router.put('/auth/update/profil', updateUserProfile, authenticateToken); // Modifier profil utilisateur
router.put('/auth/update/admin', updateUserAdmin, authenticateToken, authorizeRole(['admin'])); // Modifier profil admin
router.post('/auth/delete', authenticateToken, deleteUserWithFeedback); // Suppression utilisateur

// =============================
// Mot de passe
// =============================
router.post('/auth/password/request-reset', requestResetPasswordController, authenticateToken); // Demander reset
router.post('/auth/password/reset', resetUserPassword, authenticateToken); // Réinitialiser

// -----------------
// Multer configuration
// -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/users'), // dossier de sauvegarde
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/webp', 'image/png', 'image/jpeg'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Seuls les fichiers .webp, .png et .jpg sont autorisés'), false);
};

const upload = multer({ storage, fileFilter });

// -----------------
// Route upload
// -----------------
router.post('/auth/user/upload', upload.single('file'), uploadUserFile);
router.delete('/auth/user/delete', deleteUserFile);

export default router;
