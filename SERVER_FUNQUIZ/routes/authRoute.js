import {
  getUserPoints,
  sendOtp,
  verifyOtp,
} from "../controllers/authController.js";

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
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
  me,
  importUsers,
} from "../controllers/authController.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middleware/authentification.js";

const router = express.Router();

// =============================
// Authentification & Utilisateur
// =============================
router.post("/auth/signup", signup); // Inscription
router.post("/auth/login", login); // Connexion
router.post("/auth/google", googleAuth); // Connexion Google
router.post("/auth/logout", logout); // Déconnexion
router.get("/auth/me", authenticateToken, me); // Récupérer l'utilisateur courant

// =============================
// Gestion Utilisateurs/Admin
// =============================
router.get("/auth/all", allUsers); // Tous les utilisateurs
router.put("/auth/update/profil", authenticateToken, updateUserProfile); // Modifier profil utilisateur
router.put(
  "/auth/update/admin",
  authenticateToken,
  authorizeRole(["admin"]),
  updateUserAdmin,
); // Modifier profil admin
router.post("/auth/delete", authenticateToken, deleteUserWithFeedback); // Suppression utilisateur

// =============================
// Mot de passe
// =============================
router.post(
  "/auth/password/request-reset",
  requestResetPasswordController,
  authenticateToken,
); // Demander reset
router.post("/auth/password/reset", resetUserPassword, authenticateToken); // Réinitialiser
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
// -----------------
// Multer configuration
// -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/users"), // dossier de sauvegarde
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/webp", "image/png", "image/jpeg"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else
    cb(
      new Error("Seuls les fichiers .webp, .png et .jpg sont autorisés"),
      false,
    );
};

const upload = multer({ storage, fileFilter });

// -----------------
// Route upload
// -----------------
router.post("/auth/user/upload", upload.single("file"), uploadUserFile);
router.delete("/auth/user/delete", deleteUserFile);

// Import utilisateurs (CSV/XLSX)
const importStorage = multer.memoryStorage();
const importFileFilter = (req, file, cb) => {
  const allowed = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/octet-stream",
    "text/tab-separated-values",
  ];
  console.log("[Import] fileFilter mimetype:", file.mimetype);
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Types autorisés: .csv, .xlsx"), false);
};
const importUpload = multer({
  storage: importStorage,
  fileFilter: importFileFilter,
});

router.post(
  "/users/import",
  authenticateToken,
  authorizeRole(["admin"]),
  importUpload.single("file"),
  importUsers,
);

export default router;
