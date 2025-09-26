import express from 'express';
import multer from 'multer'
import { 
  signup, 
  login, 
  googleAuth,
  allUsers, 
  requestResetPasswordController, 
  resetUserPassword, 
  updateUserProfile,
  updateUserAdmin, 
  deleteUser,
  uploadUserFile,
  deleteUserFile

} from '../controllers/authController.js';
import { authenticateToken, authorizeRole } from '../middleware/authentification.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// -----------------------------
// 1️⃣ Récupérer tous les utilisateurs
// -----------------------------
router.post('/auth/signup', signup); //ok
router.post('/auth/login', login); //ok
router.post('/auth/google', googleAuth); //ok

router.get('/auth/all', allUsers); //ok
router.post('/auth/password/request-reset', requestResetPasswordController, authenticateToken); //ok
router.post('/auth/password/reset', resetUserPassword, authenticateToken); //ok
router.put('/auth/update/profil', updateUserProfile, authenticateToken); //{"user_id": 12, "name": "Nouveau nom", "email": "nouveau@mail.com"} ok
router.put('/auth/update/admin', updateUserAdmin, authenticateToken, authorizeRole(['admin'])); //{ "user_id": 12, "role": "admin", "status": 0} ok
router.delete('/auth/delete', deleteUser, authenticateToken);


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/webp') cb(null, true);
  else cb(new Error('Seulement les fichiers .webp sont autorisés'), false);
};

const upload = multer({ storage, fileFilter });

router.post('/auth/user/upload', upload.single('file'), uploadUserFile);
router.delete('/auth/user/delete', deleteUserFile);

export default router;
