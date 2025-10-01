
import { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  requestPasswordReset, 
  registerOrLoginGoogleUser ,
  resetPassword, 
  deleteUserSoft,
  updateUserFile,
  getUserFile,
  updateUserFields,
  getUserById,
  createFeedback
} from '../models/authModel.js';
import { mailInscription, mailConnected, sendResetCodeEmail, mailAccountDeleted, mailUpdateProfile } from '../utils/mail.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import fs from 'fs'; // si tu supprimes des fichiers


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

// Retourne l'utilisateur courant à partir du token (pour /auth/me)
export const me = (req, res) => {
  res.status(200).json(req.user);
};
// -----------------------------
// 1️⃣ Récupérer tous les utilisateurs
// -----------------------------
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
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' } 
    );

    res.status(201).json({
      message: 'Utilisateur inscrit',
      token,
      user
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
      // Gestion spécifique du mot de passe incorrect
      if (err.message && (err.message.toLowerCase().includes('password') || err.message.toLowerCase().includes('mot de passe'))) {
        return res.status(400).json({
          error: 'Mot de passe incorrect',
          type: 'erreur'
        });
      }
      // Gestion utilisateur non trouvé
      if (err.message && (err.message.toLowerCase().includes('user') || err.message.toLowerCase().includes('utilisateur'))) {
        return res.status(400).json({
          error: "Utilisateur non trouvé",
          type: 'erreur'
        });
      }
      // Autre erreur
      return res.status(400).json({
        error: err.message,
        type: 'erreur'
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
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    await mailConnected(user.email, user.first_name, req.ip);

    res.status(200).json({ 
      message: 'Connexion réussie', 
      type: 'succès',
      token, 
      user: { user_id: user.user_id } 
    });
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      type: 'erreur'
    });
  }
};

// -----------------------------
// 3️⃣ Connexion/inscription google
// -----------------------------
export const googleAuth = async (req, res) => {
  try {
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
      avatar_url: picture
    });

    // Générer JWT
    const jwtToken = jwt.sign({
      user_id: user.user_id,
      email: user.email,
      avatar: user.avatar_url,
      name: user.name,
      firstname: user.first_name,
      role: user.role 
    }, JWT_SECRET, { expiresIn: '1h' });

    // Réponse
    res.status(200).json({ 
      message: 'Connexion / Inscription Google réussie', 
      token: jwtToken, 
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar_url
      } 
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
    await sendResetCodeEmail(email, '', resetCode);
    res.status(200).json({ message: 'Code de réinitialisation envoyé par mail' });
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
    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
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
    if (!user_id) throw new Error('user_id requis');

    const allowedFields = ['name', 'first_name', 'email', 'number', 'avatar_url'];
    const updatedUser = await updateUserFields(user_id, fields, allowedFields);

    // Envoi mail notification
    await mailUpdateProfile(updatedUser.email, updatedUser.first_name);

    res.status(200).json({ message: 'Profil mis à jour', user: updatedUser });
  } catch (error) {
    console.error('❌ updateUserProfile:', error);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------
// Mise à jour admin (tous les champs)
// -----------------------------
export const updateUserAdmin = async (req, res) => {
  try {
    const { user_id, ...fields } = req.body;
    if (!user_id) throw new Error('user_id requis');

    const allowedFields = ['name', 'first_name', 'email', 'number', 'avatar_url', 'role', 'status'];
    
    // Vérification des champs non autorisés
    const invalidFields = Object.keys(fields).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      throw new Error(`Champs invalides : ${invalidFields.join(', ')}`);
    }

    const updatedUser = await updateUserFields(user_id, fields, allowedFields);

    // Envoi mail notification
    await mailUpdateProfile(updatedUser.email, updatedUser.first_name);

    res.status(200).json({ message: 'Utilisateur mis à jour (admin)', user: updatedUser });
  } catch (error) {
    console.error('❌ updateUserAdmin:', error);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------
// 7️⃣ Suppression soft
// -----------------------------
export const deleteUserWithFeedback = async (req, res) => {
  try {
    const { user_id, reason, comment } = req.body;

    if (!reason) return res.status(400).json({ error: 'La raison est obligatoire' });

    // 1️⃣ Enregistrer le feedback
    await createFeedback({ user_id, reason, comment });

    // 2️⃣ Supprimer l'utilisateur (soft delete)
    await deleteUserSoft(user_id);

    res.status(200).json({ message: 'Votre compte a été supprimé et votre feedback enregistré.' });
  } catch (error) {
    console.error('❌ deleteUserWithFeedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Upload avatar
export const uploadUserFile = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) throw new Error('user_id requis');
    if (!req.file) throw new Error('Aucun fichier envoyé');

    // Chemin du nouveau fichier sauvegardé
    const filePath = `/uploads/users/${req.file.filename}`;

    // Supprimer ancien fichier si existant
    const oldFile = await getUserFile(user_id);
    if (oldFile && oldFile.startsWith('/uploads/users')) {
      const oldPath = path.join('uploads/users', path.basename(oldFile)); // chemin réel
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Mettre à jour la BDD
    await updateUserFile(user_id, filePath);

    // Répondre avec l'URL complète
    const avatarUrl = `http://${process.env.IP}:${process.env.PORT}${filePath}`;
    res.status(200).json({ message: 'Fichier uploadé avec succès', avatar_url: avatarUrl });

  } catch (error) {
    console.error('❌ uploadUserFile:', error);
    res.status(400).json({ error: error.message });
  }
};
// Supprimer avatar
export const deleteUserFile = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) throw new Error('user_id requis');

    // Récupérer le chemin du fichier dans la BDD
    const [user] = await getUserById(user_id); // créer cette fonction dans le modèle
    if (!user || !user.avatar_url) throw new Error('Aucun fichier à supprimer');

    const filePath = path.join(process.cwd(), user.avatar_url);

    // Supprimer le fichier physiquement
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Mettre à jour la BDD
    const updatedUser = await updateUserFields(user_id, { avatar_url: null }, ['avatar_url']);

    res.status(200).json({ message: 'Fichier supprimé et BDD mise à jour', user: updatedUser });
  } catch (error) {
    console.error('❌ deleteUserFile:', error);
    res.status(400).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  // Si tu utilises des cookies, tu peux les effacer ici
  res.clearCookie('token', message='Déconnexion réussie', httpOnly=true, secure=true, sameSite='None');
};

// -----------------------------
// 8️⃣ Récupérer les points d'un utilisateur
// -----------------------------
export const getUserPoints = async (req, res) => {
  try {
    const user_id = req.params.id;
    if (!user_id) return res.status(400).json({ error: 'user_id requis' });
    const [rows] = await import('../config/db.js').then(m => m.default.query('SELECT total_points FROM user_points WHERE user_id = ?', [user_id]));
    if (!rows[0]) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.status(200).json({ user_id, total_points: rows[0].total_points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
