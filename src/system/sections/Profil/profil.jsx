// profil.jsx (version corrigée et nettoyée)
import React, { useState, useRef, useEffect } from 'react';
import useAuth from '../../configurations/Context/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import uploadAvatar from '../../configurations/Services/uploadAvatar';
import authService from '../../configurations/Services/authServices';
import verification from '../../configurations/Services/verifyOtpServices.js';
import { usePopup } from '../../configurations/Context/PopupContext.jsx';
import { FaCheckCircle } from 'react-icons/fa';
import { FcAddressBook, FcPlanner } from 'react-icons/fc';
import { GiFireDash } from "react-icons/gi";
import { CgDanger } from 'react-icons/cg';
import Price from '../../../assets/icons/price/second_price.png';
import userIcon from '../../../assets/user_icon.png';

import './profil.css';

import pointService from '../../configurations/Services/pointService.js';
import quizSessionService from '../../configurations/Services/quizSessionService.js';

function ProfilePage() {
  // --- UI / flags ---
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const [isDelete, setDelete] = useState(false);
  const [checked, setChecked] = useState(false);

  // --- avatar upload ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // --- messages ---
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // --- OTP ---
  const [activeOtp, setActiveOtp] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alert0, setAlert0] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState('');

  // --- refs / navigation / auth / popup ---
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const { user, logout, loading, refreshUser } = useAuth();
  const { setActivePopup } = usePopup();

  const [editData, setEditData] = useState({
    name: '',
    first_name: '',
    email: '',
    number: '',
  });

  // --- points & history ---
  const [userPoints, setUserPoints] = useState(null);
  const [points, setPoints] = useState(0); // points identiques au header
  const [quizHistory, setQuizHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // --- Effets init / remplir editData ---
  useEffect(() => {
    document.title = 'FUNQUIZ | Mon profil';
    if (user) {
      setEditData({
        name: user.name || user.username || '',
        first_name: user.first_name || '',
        email: user.email || '',
        number: user.number || '',
      });
    }
  }, [user]);

  // --- Envoi OTP automatiquement quand alert devient true ---
  useEffect(() => {
    if (alert && user?.number) {
      verification
        .sendOtp(user.number)
        .then((response) => {
          setStatus('sent');
        })
        .catch((error) => {
          console.error('Erreur envoi OTP:', error);
          setStatus('error');
        });
    }
  }, [alert, user?.number]);

  // --- Récupération des points (détails) ---
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user?.user_id) return;
      try {
        const data = await pointService.getUserPoints(user.user_id);
        setUserPoints(data || null);
      } catch (e) {
        console.error('Erreur récupération des points utilisateur:', e);
        setUserPoints(null);
      }
    };
    fetchUserPoints();
  }, [user?.user_id]);

  // --- Points dynamiques (header) ---
  useEffect(() => {
    let ignore = false;
    const fetchPoints = async () => {
      if (user && user.user_id) {
        try {
          const data = await pointService.getUserPoints(user.user_id);
          let pts = 0;
          if (data && data.total_points !== undefined) {
            pts = Number(data.total_points);
            if (Number.isNaN(pts)) pts = 0;
          }
          if (!ignore) setPoints(pts);
        } catch {
          const fallbackPts = Number(user?.total_points) || 0;
          if (!ignore) setPoints(Number.isNaN(fallbackPts) ? 0 : fallbackPts);
        }
      } else {
        if (!ignore) setPoints(0);
      }
    };
    fetchPoints();
    return () => {
      ignore = true;
    };
  }, [user]);

  // --- Historique quiz ---
  useEffect(() => {
    let ignore = false;
    const fetchHistory = async () => {
      if (!user?.user_id) return;
      setHistoryLoading(true);
      try {
        const list = await quizSessionService.getUserSessions(user.user_id);
        if (!ignore) setQuizHistory(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Erreur récupération historique:', e);
        if (!ignore) setQuizHistory([]);
      } finally {
        if (!ignore) setHistoryLoading(false);
      }
    };
    fetchHistory();
    return () => {
      ignore = true;
    };
  }, [user?.user_id]);

  // --- OTP verification handler ---
  const handleVerify = async () => {
    if (!otpCode.trim()) {
      setStatus('error');
      alert('Veuillez entrer un code.');
      return;
    }

    setStatus('pending');
    try {
      const res = await verification.verifyOtp(user.number, otpCode.trim());
      if (res?.verified || res?.success) {
        setStatus('success');
        setActiveOtp(false);
        setAlert(false);
        setAlert0(true);
        setOtpCode('');
        if (refreshUser) await refreshUser();
        alert('✅ Numéro vérifié avec succès !');
        window.location.reload();
      } else {
        setStatus('error');
        alert('❌ Code incorrect, veuillez réessayer.');
      }
    } catch (error) {
      setStatus('error');
      const errorMsg =
        error?.response?.data?.message || error.message || 'Erreur lors de la vérification du code.';
      alert('❌ ' + errorMsg);
    }
  };

  // --- delete flow (ouvre popup global) ---
  const handleDelete = async () => {
    setActivePopup('deleteUser');
    setDelete(false);
  };

  // --- Normalisation userInfo pour le JSX ---
  const userInfo = {
    username: user?.name || '',
    firstname: user?.first_name || '',
    email: user?.email || '',
    number: user?.number || '',
    is_verify: user?.is_verify ?? 0,
    joinDate: user?.joinDate || user?.created_at || user?.createdAt || null,
    avatar: user?.avatar || user?.avatar_url || '',
    favoriteCategory: user?.favoriteCategory || user?.favorite_thematic || '—',
  };

  // --- Calcul des userStats (utilise points et userPoints si dispo) ---
  const level = Number(userPoints?.level) || Number(user?.level) || 1;
  const nextLevelXP = Number(userPoints?.next_level_xp) || Number(user?.nextLevelXP) || 100;
  const totalQuizzes = Number(userPoints?.total_games_played) || Number(user?.totalQuizzes) || 0;
  const correctAnswers =
    Number(userPoints?.total_correct_answers) || Number(user?.correctAnswers) || 0;
  const streak = Number(userPoints?.current_streak) || Number(user?.streak) || 0;

  const userStats = {
    level,
    xp: Number.isNaN(Number(points)) ? 0 : Number(points),
    nextLevelXP,
    totalQuizzes,
    correctAnswers,
    streak,
  };

  const progressPercentage = Math.max(
    0,
    Math.min(100, userStats.nextLevelXP ? Math.round((userStats.xp / userStats.nextLevelXP) * 100) : 0)
  );

  // --- contenu des onglets (fonction interne unique) ---
  const renderTabContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="p-3">
          <h4>Vue d'ensemble</h4>
          <p>Résumé de votre activité.</p>
        </div>
      );
    }
    if (activeTab === 'quizzes') {
      return (
        <div className="p-3">
          <h4>Mes Quiz</h4>
          <p>Liste de vos quiz joués et en cours.</p>
        </div>
      );
    }
    if (activeTab === 'achievements') {
      return (
        <div className="p-3">
          <h4>Succès</h4>
          <p>Vos badges et récompenses.</p>
        </div>
      );
    }
    if (activeTab === 'settings') {
      return (
        <div className="p-3">
          <h4>Paramètres</h4>
          <p>Gérez vos préférences de profil.</p>
        </div>
      );
    }
    if (activeTab === 'history') {
      return (
        <div className="p-3">
          <h4>Historique de quiz</h4>
          {historyLoading ? (
            <p>Chargement...</p>
          ) : quizHistory.length === 0 ? (
            <p>Aucun historique pour le moment.</p>
          ) : (
            <>
              <ul className="list-unstyled d-flex flex-column gap-2">
                {quizHistory.slice(0, 15).map((s) => {
                  const dateStr = s.last_activity
                    ? new Date(s.last_activity).toLocaleString('fr-FR')
                    : '—';
                  const score = s.current_score ?? s.score ?? 0;
                  const correct = s.correct_answers_count ?? 0;
                  const statusText = s.is_completed ? 'Terminé' : 'En cours';
                  return (
                    <li
                      key={s.session_id || s.id || `${s.last_activity}-${Math.random()}`}
                      className="d-flex align-items-center justify-content-between p-2 border rounded-3"
                    >
                      <div className="d-flex flex-column">
                        <strong>Session #{s.session_id ?? s.id}</strong>
                        <small className="text-muted">{dateStr}</small>
                      </div>
                      <div className="d-flex gap-4">
                        <span>Score: {score}</span>
                        <span>Correctes: {correct}</span>
                        <span>Statut: {statusText}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // --- loaders / guards ---
  if (loading) return <div>Chargement...</div>;
  if (!user) return <div>Utilisateur non connecté</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header d-flex flex-column flex-md-row align-items-md-center justify-content-md-center gap-4">
            <div className="d-flex flex-column align-items-center position-relative">
              <img
                className="avatar mb-3"
                src={userInfo.avatar || userIcon}
                alt={userInfo.username || 'Avatar'}
                style={{ objectFit: 'cover' }}
              />
              {['moderator', 'admin'].includes(user?.role) && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    style={{ top: '10px', right: '50px', backgroundColor: '#000' }}
                    className="text-light shadow rounded-circle p-2 border-0 position-absolute z-3"
                  >
                    <GiFireDash color='#ff7300' className='bg-none' size={24} />
                  </button>
                )}
              {/* file input caché */}
              <input
                type="file"
                accept="image/webp"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setSelectedFile(file || null);
                  setPreviewUrl(file ? URL.createObjectURL(file) : null);
                }}
              />
              <div className="d-flex gap-2">
                
                <button
                  onClick={() => {
                    setVisible(true);
                    setIsEditing((prev) => !prev);
                  }}
                  className={`edit-btn ${isEditing ? 'save' : ''}`}
                >
                  Modifier
                </button>

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
                <h1 className="mb-2 text-capitalize">{userInfo.username} {userInfo.firstname}</h1>
              </div>
              <div className="user-details d-flex flex-column gap-2">
                <p className="d-flex align-items-center gap-2">
                  <FcAddressBook /> {userInfo.email}
                </p>
                <p className="d-flex align-items-center gap-2">
                  {userInfo.is_verify === 0 ? (
                    <button
                      onClick={() => setActiveOtp(true)}
                      className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2"
                    >
                      <FcAddressBook />
                      +{userInfo.number}{' '}
                      <CgDanger color="red" title="Non vérifié" size={18} />
                    </button>
                  ) : (
                    <>
                      <FcAddressBook />+{userInfo.number}{' '}
                      <FaCheckCircle color="green" title="Vérifié" size={16} />
                    </>
                  )}
                </p>
                <p className="d-flex align-items-center gap-2">
                  <FcPlanner /> Membre depuis{' '}
                  {userInfo.joinDate ? new Date(userInfo.joinDate).toLocaleDateString('fr-FR') : '—'}
                </p>
              </div>
            </div>

            <div className="level-box d-flex flex-column align-items-center">
              <div className="level-icon mb-2" style={{ width: '100px' }}>
                <img src={Price} className="w-100 h-100" alt="Level icon" />
              </div>
              <div className="level-title mb-1">Niv {userStats.level}</div>
              <div className="level-xp mb-2">
                {userStats.xp} / {userStats.nextLevelXP} XP
              </div>
              <div className="progress-bar" aria-hidden>
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card blue">
              📊 {userStats.totalQuizzes} <span>Quiz Terminés</span>
            </div>
            <div className="stat-card green">
              ✅ {userStats.correctAnswers} <span>Bonnes Réponses</span>
            </div>
            <div className="stat-card orange">
              🔥 {quizHistory.length}
              <span>Historique</span>
            </div>
            <div className="stat-card pink">
              ❤️ {userInfo.favoriteCategory} <span>Catégorie Préférée</span>
            </div>
          </div>
        </div>

        <div className="tabs">
          {[
            { id: 'overview', label: "Vue d'ensemble", icon: '📈' },
            { id: 'quizzes', label: 'Mes Quiz', icon: '📝' },
            { id: 'achievements', label: 'Succès', icon: '🏆' },
            { id: 'history', label: 'Historique', icon: '🕘' },
            { id: 'settings', label: 'Paramètres', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">{renderTabContent()}</div>

        {/* Modal OTP */}
        {activeOtp && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            {alert0 && (
              <div className="shadow-lg p-4 rounded-4 bg-white text-center" style={{ maxWidth: 400 }}>
                <h3 className="mb-3">Vérification requise</h3>
                <p className="mb-4">
                  Vous devez vérifier votre numéro pour accéder à certaines fonctionnalités de notre
                  application.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    onClick={() => {
                      setActiveOtp(false);
                      setAlert0(true);
                      setAlert(false);
                    }}
                    className="btn btn-outline-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      setAlert0(false);
                      setAlert(true);
                    }}
                    className="btn btn-primary"
                  >
                    Vérifier
                  </button>
                </div>
              </div>
            )}

            {alert && (
              <div className="shadow-lg p-4 rounded-4 bg-white text-center" style={{ maxWidth: 400 }}>
                <h2 className="mb-3">Vérification du numéro</h2>
                <p className="mb-3">
                  Un code de vérification a été envoyé à votre numéro <strong>{userInfo.number}</strong>. Veuillez entrer le code ci-dessous :
                </p>
                <input
                  type="text"
                  placeholder="Entrez le code OTP"
                  className="mb-3 text-center"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                />
                <div className="d-flex justify-content-center gap-3">
                  <button
                    onClick={() => {
                      setActiveOtp(false);
                      setAlert(false);
                      setAlert0(true);
                      setOtpCode('');
                      setStatus('');
                    }}
                    className="btn btn-outline-secondary"
                  >
                    Annuler
                  </button>
                  <button onClick={handleVerify} className="btn btn-primary" disabled={status === 'pending'}>
                    {status === 'pending' ? 'Vérification...' : 'Vérifier'}
                  </button>
                </div>
                {status === 'sent' && <p className="text-success mt-2">Code envoyé !</p>}
                {status === 'pending' && <p className="text-info mt-2">Vérification en cours...</p>}
                {status === 'error' && <p className="text-danger mt-2">Erreur, réessayez !</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {successMsg && <div className="alert alert-success text-center">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger text-center">{errorMsg}</div>}

      {/* Modal Modifier profil */}
      {isVisible && (
        <div className="position-fixed w-100 h-100 top-0 bottom-0 start-0 end-0 z-1 bg-black bg-opacity-50 d-flex align-items-center justify-content-center">
          <div style={{ maxWidth: 700 }} className="position-relative bg-dark rounded-3 p-4 w-100">
            <button
              className="position-absolute top-0 bg-danger end-0 m-2 btn btn-close"
              onClick={() => setVisible(false)}
            />
            <h3 className="mb-4 text-light">Modifier mon profil</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setUploading(true);
                try {
                  if (selectedFile) {
                    await uploadAvatar(user.user_id, selectedFile);
                  }
                  await authService.putUserById(user.user_id, editData);
                  setUploading(false);
                  setVisible(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setSuccessMsg('Profil mis à jour avec succès !');
                  setErrorMsg('');
                  if (refreshUser) await refreshUser();
                  setTimeout(() => {
                    window.location.reload();
                  }, 800);
                } catch (err) {
                  console.error('Erreur sauvegarde profil:', err);
                  setUploading(false);
                  setErrorMsg('Erreur lors de la sauvegarde du profil');
                  setSuccessMsg('');
                }
              }}
            >
              <div className="d-flex gap-4">
                <div className="mb-3 w-100">
                  <label className="form-label">Nom</label>
                  <input type="text" className="form-control" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div className="mb-3 w-100">
                  <label className="form-label">Prénom(s)</label>
                  <input type="text" className="form-control" value={editData.first_name} onChange={(e) => setEditData({ ...editData, first_name: e.target.value })} />
                </div>
              </div>

              <div className="d-flex gap-4">
                <div className="mb-3 w-100">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                </div>
                <div className="mb-3 w-100">
                  <label className="form-label">Téléphone</label>
                  <input type="text" className="form-control" value={editData.number} onChange={(e) => setEditData({ ...editData, number: e.target.value })} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Photo de profil (.webp)</label>
                <input type="file" accept="image/webp" className="form-control" onChange={(e) => { const file = e.target.files?.[0]; setSelectedFile(file || null); setPreviewUrl(file ? URL.createObjectURL(file) : null); }} />
                {previewUrl && <img src={previewUrl} alt="Preview" style={{ maxWidth: 120, marginTop: 8, borderRadius: 8 }} />}
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <Link className="hover-link" to="/reset">Mot de passe oublié ?</Link>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setVisible(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success" disabled={uploading}>{uploading ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <Link onClick={() => setDelete(true)} className="text-delete mt-5" to={'#'}>
        Supprimer définitivement mon compte
      </Link>

      {/* Modal Suppression */}
      {isDelete && (
        <div className="position-fixed w-100 h-100 top-0 bottom-0 start-0 end-0 z-1 bg-black bg-opacity-50 d-flex align-items-center justify-content-center">
          <div style={{ maxWidth: 600 }} className="p-4 w-100 rounded shadow bg-dark">
            <h2 className="text-danger text-center text-light mb-3">⚠️ Avertissement</h2>
            <p className="text-center text-light">
              En cliquant sur <span className="fw-bold text-danger">continuer</span>, vous disposerez d'un délai de <strong>30 jours</strong> pour vous rétracter. Passé ce délai, votre compte sera <span className="fw-bold text-danger">définitivement supprimé</span>.
            </p>
            <div className="form-check my-3">
              <input type="checkbox" className="form-check-input" id="confirmation" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              <label style={{ fontSize: '12px' }} className="form-check-label text-light" htmlFor="confirmation">
                En cochant cette case, vous confirmez être pleinement conscient(e) de cet acte.
              </label>
            </div>
            <div className="d-flex gap-3 mt-4">
              <button type="button" className="btn btn-secondary flex-fill" onClick={() => { setDelete(false); setChecked(false); }}>Annuler</button>
              <button onClick={handleDelete} className="btn btn-danger flex-fill" disabled={!checked}>Continuer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
