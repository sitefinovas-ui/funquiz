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
  const [quizHistory, setQuizHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // --- Suppression de compte (Paramètres > Zone de danger)
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteComment, setDeleteComment] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user?.user_id) {
      alert('Utilisateur non identifié.');
      return;
    }
    if (!deleteReason) {
      alert('Veuillez sélectionner une raison.');
      return;
    }
    if (confirmText.trim() !== 'SUPPRIMER') {
      alert('Veuillez taper “SUPPRIMER” pour confirmer.');
      return;
    }
    setDeleting(true);
    try {
      const res = await authService.deleteUserSoft({
        user_id: user.user_id,
        reason: deleteReason,
        comment: deleteComment,
      });
      alert(res?.message || 'Compte supprimé avec succès.');
      if (logout) logout();
      navigate('/');
    } catch (error) {
      alert(error.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleting(false);
    }
  };

  // --- Préférences locales (UI seulement, à connecter plus tard à une API)
  const [prefs, setPrefs] = useState({
    theme: 'system',
    accent: 'blue',
    notifications: { email: true, push: false, frequency: 'weekly' },
    gameplay: { defaultDifficulty: 'normal', timer: true, hints: false },
    privacy: { visibility: 'friends', leaderboardOptIn: true, hideUsername: false },
    accessibility: { fontScale: 1.0, reduceMotion: false },
  });

  // --- Handlers ---
  const handlePrefChange = (path, value) => {
    setPrefs((prev) => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  // Filtres / recherche pour "Mes Quiz"
  const [quizFilter, setQuizFilter] = useState('all'); // 'all' | 'en_cours' | 'termine'
  const [quizQuery, setQuizQuery] = useState('');


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
        .then(() => {
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

  // (SUPPRIMÉ) --- Points dynamiques (header) ---
  // L'effet et l'état 'points' ont été retirés car non utilisés et source d'avertissements.

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
  const xpInLevel = Number(userPoints?.xp_in_level) || 0;
  const levelSpan = Number(userPoints?.level_span) || 100; // fallback raisonnable
  const nextLevelXP = Number(userPoints?.next_level_xp) || Math.max(0, levelSpan - xpInLevel);

  const totalQuizzes = Number(userPoints?.total_games_played) || Number(user?.totalQuizzes) || 0;
  const correctAnswers =
    Number(userPoints?.total_correct_answers) || Number(user?.correctAnswers) || 0;
  const streak = Number(userPoints?.current_streak) || Number(user?.streak) || 0;

  const userStats = {
    level,
    xpInLevel,
    levelSpan,
    nextLevelXP,
    totalQuizzes,
    correctAnswers,
    streak,
  };

  const progressPercentage = Math.max(
    0,
    Math.min(100, userStats.levelSpan ? Math.round((userStats.xpInLevel / userStats.levelSpan) * 100) : 0)
  );

  // --- contenu des onglets (fonction interne unique) ---
  const renderTabContent = () => {
    if (activeTab === 'overview') {
      const accuracyHint =
        userStats.correctAnswers >= 200 ? 'Excellent rythme, continue comme ça !' :
        userStats.correctAnswers >= 100 ? 'Super progression, vise les 200 réponses correctes.' :
        'Commence par des quiz courts et réguliers pour progresser.';
      return (
        <div className="p-3 text-dark">
          <h4 className="mb-3">Vue d&apos;ensemble</h4>

          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="border rounded-3 p-3 h-100">
                <div className="fw-bold">Niveau</div>
                <div className="fs-4">Niv {userStats.level}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="border rounded-3 p-3 h-100">
                <div className="fw-bold">XP</div>
                <div className="small mb-2">
                  {userStats.xpInLevel} / {userStats.levelSpan}
                </div>
                <div className="progress" aria-hidden="true">
                  <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="border rounded-3 p-3 h-100">
                <div className="fw-bold">Série</div>
                <div className="fs-5">🔥 {userStats.streak}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="border rounded-3 p-3 h-100">
                <div className="fw-bold">Quiz joués</div>
                <div className="fs-5">📊 {userStats.totalQuizzes}</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h6 className="mb-2">Dernières activités</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              {quizHistory.slice(0, 3).map((s) => {
                const dateStr = s.last_activity ? new Date(s.last_activity).toLocaleString('fr-FR') : '—';
                const score = s.current_score ?? s.score ?? 0;
                const statusText = s.is_completed ? 'Terminé' : 'En cours';
                return (
                  <li
                    key={s.session_id || s.id || `${s.last_activity}-${Math.random()}`}
                    className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center border rounded-3 p-2"
                  >
                    <div className="d-flex flex-column min-w-0">
                      <strong className="text-truncate">Session #{s.session_id ?? s.id}</strong>
                      <small className="text-muted text-truncate">{dateStr}</small>
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-2 mt-sm-0">
                      <span className="badge rounded-pill bg-light border text-dark">Score: {score}</span>
                      <span className="badge rounded-pill bg-light border text-dark">Statut: {statusText}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 p-3 rounded-3 bg-light border">
            <div className="fw-bold mb-1">Conseil</div>
            <div className="small">{accuracyHint}</div>
          </div>
        </div>
      );
    }
  
    if (activeTab === 'quizzes') {
      const items = quizHistory
        .filter((s) => {
          if (quizFilter === 'en_cours') return !s.is_completed;
          if (quizFilter === 'termine') return !!s.is_completed;
          return true;
        })
        .filter((s) => {
          const hay = `${s.session_id ?? s.id ?? ''} ${s.last_activity ?? ''}`.toLowerCase();
          return hay.includes(quizQuery.trim().toLowerCase());
        })
        .slice(0, 20);

      return (
        <div className="p-3 text-dark">
          <h4 className="mb-3">Mes Quiz</h4>

          <div className="d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-center mb-3">
            <div className="btn-group" role="group" aria-label="Filtres">
              <button className={`btn btn-sm ${quizFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setQuizFilter('all')}>Tous</button>
              <button className={`btn btn-sm ${quizFilter === 'en_cours' ? 'btn-primary text-nowrap' : 'btn-outline-primary text-nowrap'}`} onClick={() => setQuizFilter('en_cours')}>En cours</button>
              <button className={`btn btn-sm ${quizFilter === 'termine' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setQuizFilter('termine')}>Terminés</button>
            </div>
            <input
              className="form-control form-control-sm"
              placeholder="Recherche par ID/date..."
              value={quizQuery}
              onChange={(e) => setQuizQuery(e.target.value)}
            />
          </div>

          {items.length === 0 ? (
            <p className="text-muted">Aucun résultat.</p>
          ) : (
            <ul className="list-unstyled d-flex flex-column gap-2">
              {items.map((s) => {
                const dateStr = s.last_activity ? new Date(s.last_activity).toLocaleString('fr-FR') : '—';
                const score = s.current_score ?? s.score ?? 0;
                const statusText = s.is_completed ? 'Terminé' : 'En cours';
                return (
                  <li
                    key={s.session_id || s.id || `${s.last_activity}-${Math.random()}`}
                    className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 p-2 border rounded-3"
                  >
                    <div className="d-flex flex-column min-w-0">
                      <strong className="text-truncate">Session #{s.session_id ?? s.id}</strong>
                      <small className="text-muted text-truncate">{dateStr}</small>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <span className={`badge rounded-pill ${s.is_completed ? 'bg-success' : 'bg-warning'} text-dark`}>
                        {statusText}
                      </span>
                      <span className="badge rounded-pill bg-light border text-dark">Score: {score}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      );
    }
  
    if (activeTab === 'achievements') {
      const badges = [
        { key: 'level5', name: 'Pilote', desc: 'Atteindre le niveau 5', unlocked: userStats.level >= 5, emoji: '🛡️' },
        { key: 'quizzes10', name: 'Assidu', desc: '10 quiz joués', unlocked: userStats.totalQuizzes >= 10, emoji: '📚' },
        { key: 'streak5', name: 'En série', desc: 'Série de 5 jours', unlocked: userStats.streak >= 5, emoji: '🔥' },
        { key: 'correct100', name: 'Érudit', desc: '100 réponses correctes', unlocked: userStats.correctAnswers >= 100, emoji: '🎓' },
      ];
      const nextObjective =
        badges.find((b) => !b.unlocked)?.desc || 'Tous les objectifs atteints, superbe !';

      return (
        <div className="p-3 text-dark">
          <h4 className="mb-3">Succès</h4>
          <div className="row g-3">
            {badges.map((b) => (
              <div key={b.key} className="col-6 col-md-3">
                <div className={`border rounded-3 p-3 h-100 d-flex flex-column align-items-center text-center ${b.unlocked ? '' : 'opacity-50'}`}>
                  <div className="fs-2">{b.emoji}</div>
                  <div className="fw-bold mt-2">{b.name}</div>
                  <small className="text-muted">{b.desc}</small>
                  <span className={`badge mt-2 ${b.unlocked ? 'bg-success' : 'bg-secondary'}`}>
                    {b.unlocked ? 'Débloqué' : 'Verrouillé'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-3 bg-light border">
            <div className="fw-bold mb-1">Prochain objectif</div>
            <div className="small">{nextObjective}</div>
          </div>
        </div>
      );
    }
  
    if (activeTab === 'settings') {
      return (
        <div className="p-3 text-dark">
          <h4 className="mb-3">Paramètres</h4>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="border rounded-3 p-3 h-100">
                <div className="fw-bold mb-2">Apparence</div>
                <label className="form-label">Thème</label>
                <select
                  className="form-select form-select-sm mb-2"
                  value={prefs.theme}
                  onChange={(e) => handlePrefChange('theme', e.target.value)}
                >
                  <option value="system">Système</option>
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                </select>
                <label className="form-label">Couleur d’accent</label>
                <select
                  className="form-select form-select-sm"
                  value={prefs.accent}
                  onChange={(e) => handlePrefChange('accent', e.target.value)}
                >
                  <option value="blue">Bleu</option>
                  <option value="purple">Violet</option>
                  <option value="green">Vert</option>
                  <option value="orange">Orange</option>
                </select>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="border rounded-3 p-3 h-100">
                <div className="fw-bold mb-2">Notifications</div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notifEmail"
                    checked={prefs.notifications.email}
                    onChange={(e) => handlePrefChange('notifications.email', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="notifEmail">Email</label>
                </div>
                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notifPush"
                    checked={prefs.notifications.push}
                    onChange={(e) => handlePrefChange('notifications.push', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="notifPush">Push</label>
                </div>
                <label className="form-label mt-2">Fréquence</label>
                <select
                  className="form-select form-select-sm"
                  value={prefs.notifications.frequency}
                  onChange={(e) => handlePrefChange('notifications.frequency', e.target.value)}
                >
                  <option value="immediate">Immédiat</option>
                  <option value="daily">Journalier</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="border rounded-3 p-3 h-100">
                <div className="fw-bold mb-2">Jeu</div>
                <label className="form-label">Difficulté par défaut</label>
                <select
                  className="form-select form-select-sm mb-2"
                  value={prefs.gameplay.defaultDifficulty}
                  onChange={(e) => handlePrefChange('gameplay.defaultDifficulty', e.target.value)}
                >
                  <option value="easy">Facile</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Difficile</option>
                </select>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="timer"
                    checked={prefs.gameplay.timer}
                    onChange={(e) => handlePrefChange('gameplay.timer', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="timer">Minuteur</label>
                </div>
                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hints"
                    checked={prefs.gameplay.hints}
                    onChange={(e) => handlePrefChange('gameplay.hints', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="hints">Aides</label>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="border rounded-3 p-3 h-100">
                <div className="fw-bold mb-2">Confidentialité</div>
                <label className="form-label">Visibilité du profil</label>
                <div className="btn-group mb-2" role="group">
                  {['public', 'friends', 'private'].map((opt) => (
                    <button
                      key={opt}
                      className={`btn btn-sm ${prefs.privacy.visibility === opt ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handlePrefChange('privacy.visibility', opt)}
                    >
                      {opt === 'public' ? 'Public' : opt === 'friends' ? 'Amis' : 'Privé'}
                    </button>
                  ))}
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="leaderboardOptIn"
                    checked={prefs.privacy.leaderboardOptIn}
                    onChange={(e) => handlePrefChange('privacy.leaderboardOptIn', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="leaderboardOptIn">Participer aux classements</label>
                </div>
                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hideUsername"
                    checked={prefs.privacy.hideUsername}
                    onChange={(e) => handlePrefChange('privacy.hideUsername', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="hideUsername">Masquer le pseudo</label>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="border rounded-3 p-3">
                <div className="fw-bold mb-2">Accessibilité</div>
                <label className="form-label">Taille du texte</label>
                <select
                  className="form-select form-select-sm mb-2"
                  value={String(prefs.accessibility.fontScale)}
                  onChange={(e) => handlePrefChange('accessibility.fontScale', Number(e.target.value))}
                >
                  {['0.9','1.0','1.1','1.2','1.3','1.4'].map(v => (
                    <option key={v} value={v}>{v}x</option>
                  ))}
                </select>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="reduceMotion"
                    checked={prefs.accessibility.reduceMotion}
                    onChange={(e) => handlePrefChange('accessibility.reduceMotion', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="reduceMotion">Réduire les animations</label>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => alert('Paramètres sauvegardés (à connecter à l’API)')}
            >
              Enregistrer
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() =>
                setPrefs({
                  theme: 'system',
                  accent: 'blue',
                  notifications: { email: true, push: false, frequency: 'weekly' },
                  gameplay: { defaultDifficulty: 'normal', timer: true, hints: false },
                  privacy: { visibility: 'friends', leaderboardOptIn: true, hideUsername: false },
                  accessibility: { fontScale: 1.0, reduceMotion: false },
                })
              }
            >
              Réinitialiser
            </button>
          </div>
        </div>
      );
    }
  
    if (activeTab === 'history') {
      return (
        <div className="p-3 text-dark">
          <h4>Historique de quiz</h4>
          {historyLoading ? (
            <p>Chargement...</p>
          ) : quizHistory.length === 0 ? (
            <p>Aucun historique pour le moment.</p>
          ) : (
            <ul className="list-unstyled d-flex flex-column gap-2">
              {quizHistory.slice(0, 15).map((s) => {
                const dateStr = s.last_activity ? new Date(s.last_activity).toLocaleString('fr-FR') : '—';
                const score = s.current_score ?? s.score ?? 0;
                const correct = s.correct_answers_count ?? 0;
                const statusText = s.is_completed ? 'Terminé' : 'En cours';
                return (
                  <li
                    key={s.session_id || s.id || `${s.last_activity}-${Math.random()}`}
                    className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 p-2 p-md-3 border rounded-3"
                  >
                    <div className="d-flex flex-column flex-grow-1 min-w-0">
                      <strong className="text-truncate">Session #{s.session_id ?? s.id}</strong>
                      <small className="text-muted text-truncate">{dateStr}</small>
                    </div>
                    <div className="d-flex flex-wrap gap-2 gap-md-3">
                      <span className="badge rounded-pill bg-light border text-dark">Score: {score}</span>
                      <span className="badge rounded-pill bg-light border text-dark">Correctes: {correct}</span>
                      <span className="badge rounded-pill bg-light border text-dark">Statut: {statusText}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
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
              <div className="user-details d-flex text-dark flex-column gap-2">
                <p className="d-flex align-items-center gap-2">
                  <FcAddressBook /> {userInfo.email}
                </p>
                {/* Téléphone / Ajout pour comptes Google */}
                {!userInfo.number && user?.google_id ? (
                  <p className="d-flex align-items-center gap-2">
                    <FcAddressBook />
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setActivePopup('addNumber')}
                    >
                      Ajouter un numéro
                    </button>
                  </p>
                ) : (
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
                )}
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
              <div className="progress-bar" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card blue">
              📊 {userStats.totalQuizzes} <span>Quiz Terminés</span>
            </div>
            
            <div className="stat-card orange">
              🔥 {quizHistory.length}
              <span>Historique</span>
            </div>
          </div>
        </div>

        <div className="tabs">
          {[
            { id: 'overview', label: "Vue d'ensemble", icon: '📈' },
            { id: 'quizzes', label: 'Mes Quiz', icon: '📝' },
            { id: 'achievements', label: 'Succès', icon: '🏆' },
            { id: 'history', label: 'Historique', icon: '🕘' },
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
                <h3 className="mb-3 text-dark">Vérification requise</h3>
                <p className="mb-4 text-dark">
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
              <div className="shadow-lg p-4 text-dark rounded-4 bg-white text-center" style={{ maxWidth: 400 }}>
                <h2 className="mb-3">Vérification du numéro</h2>
                <p className="mb-3">
                  Un code de vérification a été envoyé à votre numéro <strong>{userInfo.number}</strong>. Veuillez entrer le code ci-dessous :
                </p>
                <input
                  type="text"
                  placeholder="Entrez le code OTP"
                  className="form-control-custom mb-3 text-center"
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

              <div className="mb-3 avatar-field">
                <label className="form-label">Photo de profil (.webp)</label>

                {/* Input caché et label cliquable */}
                <input
                  id="profileWebp"
                  type="file"
                  accept="image/webp"
                  className="visually-hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setSelectedFile(file || null);
                    setPreviewUrl(file ? URL.createObjectURL(file) : null);
                  }}
                />
                {!previewUrl && (
                  <label htmlFor="profileWebp" className="avatar-picker">
                    <span className="picker-icon">＋</span>
                    <span className="picker-text">
                      <strong>Choisir une image</strong>
                      <small>Format WebP recommandé</small>
                    </span>
                  </label>
                )}

                {/* Aperçu + action supprimer */}
                {previewUrl && (
                  <div className="avatar-preview">
                    <img src={previewUrl} alt="Preview" className="avatar-img" />
                    <div className="avatar-actions">
                      <label htmlFor="profileWebp" className="btn btn-soft">Changer</label>
                      <button
                        type="button"
                        className="btn btn-soft-danger"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
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
              En cliquant sur <span className="fw-bold text-danger">continuer</span>, vous disposerez d&apos;un délai de <strong>30 jours</strong> pour vous rétracter. Passé ce délai, votre compte sera <span className="fw-bold text-danger">définitivement supprimé</span>.
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