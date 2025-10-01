import React, { useState, useRef } from "react";
import useAuth from '../../configurations/Context/useAuth';
import { Link, useNavigate } from "react-router-dom";
import uploadAvatar from '../../configurations/Services/uploadAvatar';
import authService from '../../configurations/Services/authServices';
import { usePopup } from "../../configurations/Context/PopupContext.jsx";

import "./profil.css"; 

import { FcAddressBook, FcPlanner, FcGlobe } from "react-icons/fc";
import Price from '../../../assets/icons/price/second_price.png'



const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const [isDelete, setDelete] = useState(false);
  const [checked, setChecked] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleDelete = async () => {
    setActivePopup('deleteUser');
    setDelete(false);
  };

  React.useEffect(() => {
    document.title = "FUNQUIZ | Mon profil";
  }, []);
  const navigate = useNavigate();

  const { user, logout, loading, refreshUser } = useAuth();

  // Champs éditables (initialisé à vide, puis rempli quand user chargé)
  const [editData, setEditData] = useState({
    name: '',
    first_name: '',
    email: '',
    number: ''
  });

  // Met à jour editData quand user est chargé
  React.useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || user.username || '',
        first_name: user.first_name || '',
        email: user.email || '',
        number: user.number || ''
      });
    }
  }, [user]);

  const fileInputRef = useRef();

  const { setActivePopup } = usePopup();

  // fallback si user n'est pas chargé
  if (loading) return <div>Chargement...</div>;
  if (!user) return <div>Utilisateur non connecté</div>;

  // fallback pour les stats (à adapter selon backend)
  const userStats = user.stats || {
    totalQuizzes: user.totalQuizzes || 0,
    correctAnswers: user.correctAnswers || 0,
    streak: user.streak || 0,
    level: user.level || 1,
    xp: user.xp || 0,
    nextLevelXP: user.nextLevelXP || 100,
  };

  // On veut l'URL complète de l'avatar
  let apiUrl = import.meta.env.VITE_API_URL || '';
  // On retire le /api final si présent pour servir les fichiers statiques
  if (apiUrl.endsWith('/api')) apiUrl = apiUrl.slice(0, -4);
  let avatarPath = user.avatar || user.avatar_url || '';
  if (avatarPath && avatarPath.startsWith('/uploads/')) {
    avatarPath = `${apiUrl}${avatarPath}`;
  }
  const userInfo = {
    username: user.name || user.username || '',
    email: user.email || '',
    number: user.number || '',
    avatar: avatarPath,
    joinDate: user.joinDate || user.created_at || '',
    country: user.country || '',
    favoriteCategory: user.favoriteCategory || '',
  };

  const progressPercentage = (userStats.xp / userStats.nextLevelXP) * 100;

  // 👇 contenu des onglets
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div>
            <h2>📈 Vue d'ensemble</h2>
            <p>+15% par rapport à la semaine dernière</p>
          </div>
        );
      case "quizzes":
        return (
          <div>
            <h2>📝 Mes Quiz</h2>
            <p>Historique des quiz récents et scores.</p>
          </div>
        );
      case "achievements":
        return (
          <div>
            <h2>🏆 Succès</h2>
            <p>Liste de vos succès et badges débloqués.</p>
          </div>
        );
      case "settings":
        return (
          <div>
            <h2>⚙️ Paramètres</h2>
            <p>Modifiez vos informations et préférences.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-page ">
      <div className="profile-container">
        {/* Header Profile Card */}
        <div className="profile-card">
          <div className="profile-header d-flex flex-column flex-md-row align-items-md-center justify-content-md-center gap-4">
            <div className="d-flex flex-column align-items-center">
              <img 
                className="avatar mb-3" 
                src={previewUrl || userInfo.avatar} 
                alt={userInfo.username}
                style={{objectFit:'cover'}}
              />
             
              <input
                type="file"
                accept="image/webp"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={e => {
                  const file = e.target.files[0];
                  setSelectedFile(file);
                  if (file) {
                    setPreviewUrl(URL.createObjectURL(file));
                  } else {
                    setPreviewUrl(null);
                  }
                }}
              />
              <div className="d-flex gap-2">
                <button
                  onClick={() => setVisible(true)}
                  className={`edit-btn ${isEditing ? "save" : ""}`}
                >
                  Modifier
                </button>
                {['moderator', 'admin'].includes(user.role) && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-light bg-danger rounded-3 py-2 px-4 border"
                  >
                    Dashboard
                  </button>
                )}
                <button
                  onClick={async () => {
                    await logout();
                    window.location.href = '/login';
                  }}
                  className="btn btn-outline-secondary ms-2"
                >
                  Se déconnecter
                </button>
              </div>
            </div>

            <div className="user-info">
              <div className="user-info-header mb-3">
                <h1 className="mb-2">{userInfo.username}</h1>
              </div>
              <div className="user-details d-flex flex-column gap-2">
                <p className="d-flex align-items-center gap-2">
                  <FcAddressBook/> {userInfo.email}
                </p>
                <p className="d-flex align-items-center gap-2">
                  <FcAddressBook/> {userInfo.number}
                </p>
                <p className="d-flex align-items-center gap-2">
                  <FcPlanner/> Membre depuis {userInfo.joinDate}
                </p>
                <p className="d-flex align-items-center gap-2">
                  <FcGlobe/> {userInfo.country}
                </p>
              </div>
            </div>

            <div className="level-box d-flex flex-column align-items-center">
              <div className="level-icon mb-2" style={{width:'100px'}}>
                <img src={Price} className="w-100 h-100" alt="Level icon" />
              </div>
              <div className="level-title mb-1">Niv {userStats.level}</div>
              <div className="level-xp mb-2">
                {userStats.xp} / {userStats.nextLevelXP} XP
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card blue">📊 {userStats.totalQuizzes} <span>Quiz Terminés</span></div>
            <div className="stat-card green">✅ {userStats.correctAnswers} <span>Bonnes Réponses</span></div>
            <div className="stat-card orange">🔥 {userStats.streak} Quiz <span>Historique</span></div>
            
            <div className="stat-card pink">❤️ {userInfo.favoriteCategory} <span>Catégorie Préférée</span></div>{/* Stat en prenant compte du quiz le plus utilisé */}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[
            { id: "overview", label: "Vue d'ensemble", icon: "📈" },
            { id: "quizzes", label: "Mes Quiz", icon: "📝" },
            { id: "achievements", label: "Succès", icon: "🏆" },
            { id: "settings", label: "Paramètres", icon: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ✅ Contenu dynamique selon activeTab */}
        <div className="tab-content">{renderTabContent()}</div>
      </div>
      {successMsg && (
        <div className="alert alert-success text-center">{successMsg}</div>
      )}
      {errorMsg && (
        <div className="alert alert-danger text-center">{errorMsg}</div>
      )}
      {isVisible && (
        <div className="position-fixed w-100 h-100 top-0 bottom-0 start-0 end-0 z-1 bg-black bg-opacity-50 d-flex align-items-center justify-content-center">
          <div style={{maxWidth:'700px'}} className="position-relative bg-dark rounded-3 p-4 w-100">
            <button 
              className="position-absolute top-0 bg-danger end-0 m-2 btn btn-close"
              onClick={() => setVisible(false)}
            />
            <h3 className="mb-4 text-light">Modifier mon profile</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setUploading(true);
                try {
                  // 1. Upload avatar si sélectionné
                  if (selectedFile) {
                    await uploadAvatar(user.user_id, selectedFile);
                  }
                  // 2. Mettre à jour les autres champs
                  await authService.putUserById(user.user_id, editData);
                  setUploading(false);
                  setVisible(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setSuccessMsg('Profil mis à jour avec succès !');
                  setErrorMsg('');
                  if (refreshUser) await refreshUser();
                  setTimeout(() => { window.location.reload(); }, 800);
                } catch (err) {
                  setUploading(false);
                  setErrorMsg('Erreur lors de la sauvegarde du profil');
                  setSuccessMsg('');
                }
              }}
            >
              <div className="d-flex gap-4">
                <div className="mb-3 w-100">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="mb-3 w-100">
                  <label className="form-label">Prénom(s)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.first_name}
                    onChange={e => setEditData({ ...editData, first_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="d-flex gap-4">
                <div className="mb-3 w-100">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editData.email}
                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                <div className="mb-3 w-100">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.number}
                    onChange={e => setEditData({ ...editData, number: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Photo de profil (.webp)</label>
                <input
                  type="file"
                  accept="image/webp"
                  className="form-control"
                  onChange={e => {
                    const file = e.target.files[0];
                    setSelectedFile(file);
                    if (file) {
                      setPreviewUrl(URL.createObjectURL(file));
                    } else {
                      setPreviewUrl(null);
                    }
                  }}
                />
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" style={{maxWidth:120, marginTop:8, borderRadius:8}} />
                )}
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <Link className='hover-link' to='/reset'>Mot de passe oublié ?</Link>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setVisible(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success" disabled={uploading}>{uploading ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      <Link onClick={()=>setDelete(true)} className="text-delete mt-5" to={'#'}>Supprimer définitivement mon compte</Link>
      {isDelete && (
        <div className="position-fixed w-100 h-100 top-0 bottom-0 start-0 end-0 z-1 bg-black bg-opacity-50 d-flex align-items-center justify-content-center">
          <div style={{maxWidth: '600px'}} className="p-4 w-100 rounded shadow bg-dark">
            <h2 className="text-danger text-center text-light mb-3">⚠️ Avertissement</h2>
            <p className="text-center text-light">
              En cliquant sur <span className="fw-bold text-danger">continuer</span>, 
              vous disposerez d’un délai de <strong>30 jours</strong> pour vous rétracter. 
              Passé ce délai, votre compte sera 
              <span className="fw-bold text-danger"> définitivement supprimé</span>.
            </p>
            <div className="form-check my-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="confirmation"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <label style={{fontSize:'12px'}} className="form-check-label text-light" htmlFor="confirmation">
                En cochant cette case, vous confirmez être pleinement conscient(e) de cet acte.
              </label>
            </div>
            <div className="d-flex gap-3 mt-4">
              <button
                type="button"
                className="btn btn-secondary flex-fill"
                onClick={() => {
                  setDelete(false);
                  setChecked(false);
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger flex-fill"
                disabled={!checked}
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
