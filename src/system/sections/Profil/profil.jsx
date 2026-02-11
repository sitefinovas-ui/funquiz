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

  // --- avatar upload ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // --- messages ---
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // --- OTP ---
  const [activeOtp, setActiveOtp] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [alert0, setAlert0] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState('');

  // --- refs / navigation / auth / popup ---
  const fileInputRef = useRef();
  const prefsMsgTimerRef = useRef(null);
  const prefsTouchedRef = useRef(false);
  const navigate = useNavigate();
  const { user, logout, loading, refreshUser } = useAuth();
  const { setActivePopup } = usePopup();

  useEffect(() => {
    return () => {
      if (prefsMsgTimerRef.current) window.clearTimeout(prefsMsgTimerRef.current);
    };
  }, []);

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

  const PREFS_STORAGE_KEY = 'profile.prefs.v1';
  const DEFAULT_PREFS = {
    theme: 'system',
    accent: 'purple',
    gameplay: { defaultDifficulty: 'normal', timer: true, hints: false },
    privacy: { visibility: 'friends', leaderboardOptIn: true, hideUsername: false },
    accessibility: { fontScale: 1.0, reduceMotion: false },
  };

  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [prefsReady, setPrefsReady] = useState(false);
  const [prefsSavedAt, setPrefsSavedAt] = useState(null);
  const [prefsUiMessage, setPrefsUiMessage] = useState('');

  // --- Handlers ---
  const handlePrefChange = (path, value) => {
    prefsTouchedRef.current = true;
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

  const mergePrefs = (base, incoming) => {
    const next = { ...base, ...(incoming || {}) };
    next.gameplay = { ...base.gameplay, ...(incoming?.gameplay || {}) };
    next.privacy = { ...base.privacy, ...(incoming?.privacy || {}) };
    next.accessibility = { ...base.accessibility, ...(incoming?.accessibility || {}) };
    return next;
  };

  const applyPublicThemeVars = (vars) => {
    const el = document.documentElement;
    if (vars.bg) {
      el.style.setProperty('--site-bg', vars.bg);
      localStorage.setItem('public.site.bg', vars.bg);
    }
    if (vars.accent) {
      el.style.setProperty('--site-accent', vars.accent);
      el.style.setProperty('--site-accent-default', vars.accent);
      localStorage.setItem('public.site.accent', vars.accent);
    }
    if (vars.accentStrong) {
      el.style.setProperty('--site-accent-default-strong', vars.accentStrong);
    }
    if (vars.text) {
      el.style.setProperty('--site-text', vars.text);
      localStorage.setItem('public.site.text', vars.text);
    }
    if (vars.textMuted) {
      el.style.setProperty('--site-text-muted', vars.textMuted);
      localStorage.setItem('public.site.textMuted', vars.textMuted);
    }
    if (vars.link) {
      el.style.setProperty('--site-link', vars.link);
      localStorage.setItem('public.site.link', vars.link);
    }
    if (vars.surface) {
      el.style.setProperty('--site-surface', vars.surface);
      localStorage.setItem('public.site.surface', vars.surface);
    }
    if (vars.border) {
      el.style.setProperty('--site-border', vars.border);
      localStorage.setItem('public.site.border', vars.border);
    }
    if (vars.panel) {
      el.style.setProperty('--site-panel', vars.panel);
      localStorage.setItem('public.site.panel', vars.panel);
    }
  };

  const getAccentPalette = (accent) => {
    if (accent === 'blue') return { accent: '#3b82f6', accentStrong: '#2563eb', link: '#3b82f6' };
    if (accent === 'green') return { accent: '#06d47b', accentStrong: '#05b868', link: '#06d47b' };
    if (accent === 'orange') return { accent: '#ff9900', accentStrong: '#c17700', link: '#ff9900' };
    return { accent: '#9b34d3', accentStrong: '#7e2ab5', link: '#9b34d3' };
  };

  const getThemePalette = (theme) => {
    if (theme === 'light') {
      return {
        bg: '#f8fafc',
        text: '#0b1220',
        textMuted: '#4b5563',
        link: '#2563eb',
        surface: '#ffffff',
        border: 'rgba(0, 0, 0, 0.10)',
        panel: 'rgba(255, 255, 255, 0.85)',
      };
    }
    return {
      bg: '#0d0d19',
      text: '#ffffff',
      textMuted: '#a0a9c0',
      link: '#4ea1ff',
      surface: 'rgba(255, 255, 255, 0.06)',
      border: 'rgba(255, 255, 255, 0.12)',
      panel: 'rgba(0, 0, 0, 0.22)',
    };
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPrefs(mergePrefs(DEFAULT_PREFS, parsed));
      }
    } catch {
    } finally {
      setPrefsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!prefsReady) return;

    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
      const now = Date.now();
      setPrefsSavedAt(now);
      if (prefsTouchedRef.current) {
        setPrefsUiMessage('Paramètres sauvegardés.');
        if (prefsMsgTimerRef.current) window.clearTimeout(prefsMsgTimerRef.current);
        prefsMsgTimerRef.current = window.setTimeout(() => setPrefsUiMessage(''), 2500);
      }
    } catch {
    }

    const el = document.documentElement;
    const scale = Number(prefs.accessibility.fontScale);
    el.style.setProperty('--site-font-scale', String(Number.isFinite(scale) ? scale : 1));
    el.dataset.reduceMotion = prefs.accessibility.reduceMotion ? 'true' : 'false';

    const resolvedTheme =
      prefs.theme === 'system'
        ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : prefs.theme;
    const themeVars = getThemePalette(resolvedTheme);
    const accentVars = getAccentPalette(prefs.accent);
    applyPublicThemeVars({ ...themeVars, ...accentVars });
  }, [prefs, prefsReady]);

  useEffect(() => {
    if (!prefsReady) return;
    if (!window.matchMedia) return;
    if (prefs.theme !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolvedTheme = mql.matches ? 'dark' : 'light';
      const themeVars = getThemePalette(resolvedTheme);
      const accentVars = getAccentPalette(prefs.accent);
      applyPublicThemeVars({ ...themeVars, ...accentVars });
    };
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, [prefs.theme, prefs.accent, prefsReady]);

  const resetPrefs = () => {
    try {
      localStorage.removeItem(PREFS_STORAGE_KEY);
    } catch {
    }
    setPrefs(DEFAULT_PREFS);
    setPrefsUiMessage('Paramètres réinitialisés.');
    if (prefsMsgTimerRef.current) window.clearTimeout(prefsMsgTimerRef.current);
    prefsMsgTimerRef.current = window.setTimeout(() => setPrefsUiMessage(''), 2500);
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

  // --- Envoi OTP automatiquement quand showOtpPopup devient true ---
  useEffect(() => {
    if (showOtpPopup && user?.number) {
      verification
        .sendOtp(user.number)
        .then(() => {
          setStatus('sent');
        })
        .catch((error) => {
          console.error('Erreur envoi OTP:', error);
          setStatus('error');
          const errorMsg = error?.response?.data?.error || "Erreur lors de l'envoi du code.";
          window.alert('❌ ' + errorMsg);
        });
    }
  }, [showOtpPopup, user?.number]);

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
      window.alert('Veuillez entrer un code.');
      return;
    }

    setStatus('pending');
    try {
      const res = await verification.verifyOtp(user.number, otpCode.trim());
      if (res?.verified || res?.success) {
        setStatus('success');
        setActiveOtp(false);
        setShowOtpPopup(false);
        setAlert0(true);
        setOtpCode('');
        if (refreshUser) await refreshUser();
        window.alert('✅ Numéro vérifié avec succès !');
        window.location.reload();
      } else {
        setStatus('error');
        window.alert('❌ Code incorrect, veuillez réessayer.');
      }
    } catch (error) {
      setStatus('error');
      const errorMsg =
        error?.response?.data?.message || error.message || 'Erreur lors de la vérification du code.';
      window.alert('❌ ' + errorMsg);
    }
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

  const isSessionCompleted = (s) => Number(s?.is_completed) === 1;

  // --- contenu des onglets (fonction interne unique) ---
  const renderTabContent = () => {
    if (activeTab === 'overview') {
      const accuracyHint =
        userStats.correctAnswers >= 200 ? 'Excellent rythme, continue comme ça !' :
        userStats.correctAnswers >= 100 ? 'Super progression, vise les 200 réponses correctes.' :
        'Commence par des quiz courts et réguliers pour progresser.';
      return (
        <div className="profile-tab-pane fade-in">
          <h4 className="profile-section-title">Vue d&apos;ensemble</h4>

          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="stat-label">Niveau</div>
              <div className="stat-value highlight">Niv {userStats.level}</div>
            </div>
            <div className="profile-stat-card">
              <div className="stat-label">XP</div>
              <div className="stat-value">{userStats.xpInLevel} <span className="stat-sub">/ {userStats.levelSpan}</span></div>
              <div className="profile-progress-bar">
                <div className="profile-progress-fill" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
            <div className="profile-stat-card">
              <div className="stat-label">Série</div>
              <div className="stat-value">🔥 {userStats.streak}</div>
            </div>
            <div className="profile-stat-card">
              <div className="stat-label">Quiz joués</div>
              <div className="stat-value">📊 {userStats.totalQuizzes}</div>
            </div>
          </div>

          <div className="profile-section mt-4">
            <h6 className="profile-subsection-title">Dernières activités</h6>
            {quizHistory.length === 0 ? (
              <p className="profile-empty-text">Aucune activité récente.</p>
            ) : (
              <div className="profile-activity-list">
                {quizHistory.slice(0, 3).map((s, idx) => {
                  const dateStr = s.last_activity ? new Date(s.last_activity).toLocaleString('fr-FR') : '—';
                  const score = s.current_score ?? s.score ?? 0;
                  const completed = isSessionCompleted(s);
                  const statusText = completed ? 'Terminé' : 'En cours';
                  return (
                    <div key={s.session_id ?? s.id ?? idx} className="profile-activity-item">
                      <div className="activity-info">
                        <strong className="activity-title">Session #{s.session_id ?? s.id}</strong>
                        <small className="activity-date">{dateStr}</small>
                      </div>
                      <div className="activity-badges">
                        <span className="profile-badge">Score: {score}</span>
                        <span className={`profile-badge ${completed ? 'success' : 'pending'}`}>{statusText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="profile-tip-box mt-4">
            <div className="tip-title">💡 Conseil</div>
            <div className="tip-content">{accuracyHint}</div>
          </div>
        </div>
      );
    }
  
    if (activeTab === 'quizzes') {
      const items = quizHistory
        .filter((s) => {
          const completed = isSessionCompleted(s);
          if (quizFilter === 'en_cours') return !completed;
          if (quizFilter === 'termine') return completed;
          return true;
        })
        .filter((s) => {
          const hay = `${s.session_id ?? s.id ?? ''} ${s.last_activity ?? ''}`.toLowerCase();
          return hay.includes(quizQuery.trim().toLowerCase());
        })
        .slice(0, 20);

      return (
        <div className="profile-tab-pane fade-in">
          <h4 className="profile-section-title">Mes Quiz</h4>

          <div className="profile-filters">
            <div className="profile-btn-group">
              <button type="button" className={`profile-filter-btn ${quizFilter === 'all' ? 'active' : ''}`} onClick={() => setQuizFilter('all')}>Tous</button>
              <button type="button" className={`profile-filter-btn ${quizFilter === 'en_cours' ? 'active' : ''}`} onClick={() => setQuizFilter('en_cours')}>En cours</button>
              <button type="button" className={`profile-filter-btn ${quizFilter === 'termine' ? 'active' : ''}`} onClick={() => setQuizFilter('termine')}>Terminés</button>
            </div>
            <input
              className="profile-search-input"
              placeholder="Recherche par ID/date..."
              value={quizQuery}
              onChange={(e) => setQuizQuery(e.target.value)}
            />
          </div>

          {items.length === 0 ? (
            <p className="profile-empty-text">Aucun résultat trouvé.</p>
          ) : (
            <div className="profile-activity-list">
              {items.map((s, idx) => {
                const dateStr = s.last_activity ? new Date(s.last_activity).toLocaleString('fr-FR') : '—';
                const score = s.current_score ?? s.score ?? 0;
                const completed = isSessionCompleted(s);
                const statusText = completed ? 'Terminé' : 'En cours';
                return (
                  <div
                    key={s.session_id ?? s.id ?? idx}
                    className="profile-activity-item"
                  >
                    <div className="activity-info">
                      <strong className="activity-title">Session #{s.session_id ?? s.id}</strong>
                      <small className="activity-date">{dateStr}</small>
                    </div>
                    <div className="activity-badges">
                      <span className={`profile-badge ${completed ? 'success' : 'pending'}`}>
                        {statusText}
                      </span>
                      <span className="profile-badge">Score: {score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
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
        <div className="profile-tab-pane fade-in">
          <h4 className="profile-section-title">Succès</h4>
          <div className="profile-badges-grid">
            {badges.map((b) => (
              <div key={b.key} className={`profile-badge-card ${b.unlocked ? 'unlocked' : 'locked'}`}>
                <div className="badge-emoji">{b.emoji}</div>
                <div className="badge-name">{b.name}</div>
                <div className="badge-desc">{b.desc}</div>
                <span className={`badge-status ${b.unlocked ? 'success' : ''}`}>
                  {b.unlocked ? 'Débloqué' : 'Verrouillé'}
                </span>
              </div>
            ))}
          </div>

          <div className="profile-tip-box mt-4">
            <div className="tip-title">🎯 Prochain objectif</div>
            <div className="tip-content">{nextObjective}</div>
          </div>
        </div>
      );
    }
  
    if (activeTab === 'settings') {
      return (
        <div className="profile-tab-pane fade-in">
          <h4 className="profile-section-title">Paramètres</h4>

          <div className="profile-settings-grid">
            <div className="profile-settings-card">
              <div className="settings-header">Apparence</div>
              <label className="profile-label">Thème</label>
              <select
                className="profile-select"
                value={prefs.theme}
                onChange={(e) => handlePrefChange('theme', e.target.value)}
              >
                <option value="system">Système</option>
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
              <label className="profile-label mt-3">Couleur d’accent</label>
              <select
                className="profile-select"
                value={prefs.accent}
                onChange={(e) => handlePrefChange('accent', e.target.value)}
              >
                <option value="blue">Bleu</option>
                <option value="purple">Violet</option>
                <option value="green">Vert</option>
                <option value="orange">Orange</option>
              </select>
            </div>

            <div className="profile-settings-card">
              <div className="settings-header">Jeu</div>
              <label className="profile-label">Difficulté par défaut</label>
              <select
                className="profile-select"
                value={prefs.gameplay.defaultDifficulty}
                onChange={(e) => handlePrefChange('gameplay.defaultDifficulty', e.target.value)}
              >
                <option value="easy">Facile</option>
                <option value="normal">Normal</option>
                <option value="hard">Difficile</option>
              </select>
              <div className="profile-switch-row">
                <label className="profile-switch-label" htmlFor="timer">Minuteur</label>
                <input
                  className="profile-switch-input"
                  type="checkbox"
                  id="timer"
                  checked={prefs.gameplay.timer}
                  onChange={(e) => handlePrefChange('gameplay.timer', e.target.checked)}
                />
              </div>
              <div className="profile-switch-row">
                <label className="profile-switch-label" htmlFor="hints">Aides</label>
                <input
                  className="profile-switch-input"
                  type="checkbox"
                  id="hints"
                  checked={prefs.gameplay.hints}
                  onChange={(e) => handlePrefChange('gameplay.hints', e.target.checked)}
                />
              </div>
            </div>

            <div className="profile-settings-card">
              <div className="settings-header">Confidentialité</div>
              <label className="profile-label">Visibilité du profil</label>
              <div className="profile-btn-group mb-2">
                {['public', 'friends', 'private'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`profile-filter-btn ${prefs.privacy.visibility === opt ? 'active' : ''}`}
                    onClick={() => handlePrefChange('privacy.visibility', opt)}
                  >
                    {opt === 'public' ? 'Public' : opt === 'friends' ? 'Amis' : 'Privé'}
                  </button>
                ))}
              </div>
              <div className="profile-switch-row">
                <label className="profile-switch-label" htmlFor="leaderboardOptIn">Participer aux classements</label>
                <input
                  className="profile-switch-input"
                  type="checkbox"
                  id="leaderboardOptIn"
                  checked={prefs.privacy.leaderboardOptIn}
                  onChange={(e) => handlePrefChange('privacy.leaderboardOptIn', e.target.checked)}
                />
              </div>
              <div className="profile-switch-row">
                <label className="profile-switch-label" htmlFor="hideUsername">Masquer le pseudo</label>
                <input
                  className="profile-switch-input"
                  type="checkbox"
                  id="hideUsername"
                  checked={prefs.privacy.hideUsername}
                  onChange={(e) => handlePrefChange('privacy.hideUsername', e.target.checked)}
                />
              </div>
            </div>

            <div className="profile-settings-card full-width">
              <div className="settings-header">Accessibilité</div>
              <label className="profile-label">Taille du texte</label>
              <select
                className="profile-select"
                value={String(prefs.accessibility.fontScale)}
                onChange={(e) => handlePrefChange('accessibility.fontScale', Number(e.target.value))}
              >
                {['0.9','1.0','1.1','1.2','1.3','1.4'].map(v => (
                  <option key={v} value={v}>{v}x</option>
                ))}
              </select>
              <div className="profile-switch-row">
                <label className="profile-switch-label" htmlFor="reduceMotion">Réduire les animations</label>
                <input
                  className="profile-switch-input"
                  type="checkbox"
                  id="reduceMotion"
                  checked={prefs.accessibility.reduceMotion}
                  onChange={(e) => handlePrefChange('accessibility.reduceMotion', e.target.checked)}
                />
              </div>
            </div>
          </div>

          <div className="profile-settings-actions">
            <div className="profile-settings-meta">
              {prefsUiMessage ? (
                <span className="profile-settings-message">{prefsUiMessage}</span>
              ) : prefsSavedAt ? (
                <span className="profile-settings-message">
                  Dernière sauvegarde : {new Date(prefsSavedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              ) : (
                <span className="profile-settings-message"> </span>
              )}
            </div>
            <div className="profile-settings-buttons">
              <button type="button" className="profile-btn-cancel" onClick={resetPrefs}>
                Réinitialiser les paramètres
              </button>
            </div>
          </div>

          <div className="profile-danger-zone mt-4">
            <h5 className="danger-title"><CgDanger className="danger-icon" /> Zone de danger</h5>
            <p className="danger-text">La suppression est définitive. Vous perdrez tout votre historique et vos points.</p>
            {!isDelete ? (
              <button type="button" className="profile-btn-danger" onClick={() => setDelete(true)}>
                Supprimer mon compte
              </button>
            ) : (
              <div className="danger-confirm-box">
                <label className="profile-label danger">Raison du départ</label>
                <select
                  className="profile-select danger"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                >
                  <option value="">-- Choisir une raison --</option>
                  <option value="boring">Je m&apos;ennuie</option>
                  <option value="reset">Je veux recommencer à zéro</option>
                  <option value="privacy">Confidentialité</option>
                  <option value="other">Autre</option>
                </select>
                
                <input
                  className="profile-input danger mt-2"
                  placeholder="Commentaire (optionnel)"
                  value={deleteComment}
                  onChange={(e) => setDeleteComment(e.target.value)}
                />

                <p className="danger-warning mt-3">
                  Tapez <strong>SUPPRIMER</strong> pour confirmer.
                </p>
                <input
                  className="profile-input danger"
                  placeholder="SUPPRIMER"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />

                <div className="danger-actions mt-3">
                  <button type="button" className="profile-btn-cancel" onClick={() => setDelete(false)}>Annuler</button>
                  <button
                    type="button"
                    className="profile-btn-danger"
                    disabled={confirmText !== 'SUPPRIMER' || !deleteReason || deleting}
                    onClick={handleDeleteAccount}
                  >
                    {deleting ? 'Suppression...' : 'Confirmer suppression'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  
    if (activeTab === 'history') {
      return (
        <div className="profile-tab-pane fade-in">
          <h4 className="profile-section-title">Historique</h4>
          {historyLoading ? (
            <p className="profile-empty-text">Chargement...</p>
          ) : quizHistory.length === 0 ? (
            <p className="profile-empty-text">Aucun historique pour le moment.</p>
          ) : (
            <div className="profile-activity-list">
              {quizHistory.slice(0, 15).map((s, idx) => {
                const dateStr = s.last_activity ? new Date(s.last_activity).toLocaleString('fr-FR') : '—';
                const score = s.current_score ?? s.score ?? 0;
                const correct = s.correct_answers_count ?? 0;
                const completed = isSessionCompleted(s);
                const statusText = completed ? 'Terminé' : 'En cours';
                return (
                  <div key={s.session_id ?? s.id ?? idx} className="profile-activity-item">
                    <div className="activity-info">
                      <strong className="activity-title">Session #{s.session_id ?? s.id}</strong>
                      <small className="activity-date">{dateStr}</small>
                    </div>
                    <div className="activity-badges">
                      <span className={`profile-badge ${completed ? 'success' : 'pending'}`}>{statusText}</span>
                      <span className="profile-badge">Score: {score}</span>
                      <span className="profile-badge">Correctes: {correct}</span>
                    </div>
                  </div>
                );
              })}
            </div>
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
                <h1 className="mb-2 text-capitalize">
                  {prefs.privacy.hideUsername ? 'Utilisateur' : `${userInfo.username} ${userInfo.firstname}`}
                </h1>
              </div>
              <div className="user-details d-flex flex-column gap-2">
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
                {userStats.xpInLevel} / {userStats.levelSpan} XP
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
            { id: 'settings', label: 'Paramètres', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              type="button"
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
                      setShowOtpPopup(false);
                    }}
                    className="btn btn-outline-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      setAlert0(false);
                      setShowOtpPopup(true);
                    }}
                    className="btn btn-primary"
                  >
                    Vérifier
                  </button>
                </div>
              </div>
            )}

            {showOtpPopup && (
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
                      setShowOtpPopup(false);
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
    </div>
  );
}

export default ProfilePage;
