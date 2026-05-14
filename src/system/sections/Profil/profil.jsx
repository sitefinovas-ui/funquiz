import React, { useState, useRef, useEffect } from 'react';
import useAuth from '../../configurations/Context/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import uploadAvatar from '../../configurations/Services/uploadAvatar';
import authService from '../../configurations/Services/authServices';
import verification from '../../configurations/Services/verifyOtpServices.js';
import { usePopup } from '../../configurations/Context/PopupContext.jsx';
import { CgDanger } from 'react-icons/cg';
import { GiFireDash } from 'react-icons/gi';
import userIcon from '../../../assets/user_icon.png';
import pointService from '../../configurations/Services/pointService.js';
import quizSessionService from '../../configurations/Services/quizSessionService.js';
import thematicService from '../../configurations/Services/thematicServices.js';
import { computeBackendOrigin } from '../../configurations/Api/api_axios.js';

/* ─── helpers ─── */
const pill = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium';
const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm';
const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';
const selectCls = `${inputCls} appearance-none`;
const labelCls = 'block text-xs font-medium text-slate-500 mb-1.5';

function StatusBadge({ completed }) {
  return completed
    ? <span className={`${pill} bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200`}>Terminé</span>
    : <span className={`${pill} bg-amber-50 text-amber-600 ring-1 ring-amber-200`}>En cours</span>;
}
function ScoreBadge({ score }) {
  return <span className={`${pill} bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200`}>{score} pts</span>;
}
function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  );
}

const NAV = [
  { id: 'overview',     label: "Vue d'ensemble", icon: '📈' },
  { id: 'quizzes',      label: 'Mes Quiz',        icon: '📝' },
  { id: 'achievements', label: 'Succès',           icon: '🏆' },
  { id: 'history',      label: 'Historique',       icon: '🕘' },
  { id: 'settings',     label: 'Paramètres',       icon: '⚙️' },
];

const DEFAULT_PREFS = {
  theme: 'system', accent: 'purple',
  gameplay: { defaultDifficulty: 'normal', timer: true, hints: false },
  privacy: { visibility: 'friends', leaderboardOptIn: true, hideUsername: false },
  accessibility: { fontScale: 1.0, reduceMotion: false },
};
const PREFS_KEY = 'profile.prefs.v1';

function ProfilePage() {
  const [activeTab,      setActiveTab]      = useState('overview');
  const [isVisible,      setVisible]        = useState(false);
  const [isDelete,       setDelete]         = useState(false);
  const [selectedFile,   setSelectedFile]   = useState(null);
  const [previewUrl,     setPreviewUrl]     = useState(null);
  const [uploading,      setUploading]      = useState(false);
  const [successMsg,     setSuccessMsg]     = useState('');
  const [errorMsg,       setErrorMsg]       = useState('');
  const [activeOtp,      setActiveOtp]      = useState(false);
  const [showOtpPopup,   setShowOtpPopup]   = useState(false);
  const [alert0,         setAlert0]         = useState(true);
  const [otpCode,        setOtpCode]        = useState('');
  const [status,         setStatus]         = useState('');
  const [editData,       setEditData]       = useState({ name: '', first_name: '', email: '', number: '' });
  const [userPoints,     setUserPoints]     = useState(null);
  const [quizHistory,    setQuizHistory]    = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [resumingId,     setResumingId]     = useState(null);
  const [deleteReason,   setDeleteReason]   = useState('');
  const [deleteComment,  setDeleteComment]  = useState('');
  const [confirmText,    setConfirmText]    = useState('');
  const [deleting,       setDeleting]       = useState(false);
  const [quizFilter,     setQuizFilter]     = useState('all');
  const [quizQuery,      setQuizQuery]      = useState('');
  const [prefs,          setPrefs]          = useState(DEFAULT_PREFS);
  const [prefsReady,     setPrefsReady]     = useState(false);
  const [prefsSavedAt,   setPrefsSavedAt]   = useState(null);
  const [prefsUiMessage, setPrefsUiMessage] = useState('');
  const [sidebarOpen,    setSidebarOpen]    = useState(false);

  const prefsMsgTimerRef = useRef(null);
  const prefsTouchedRef  = useRef(false);
  const navigate         = useNavigate();
  const location         = useLocation();

  const { user, logout, loading, refreshUser } = useAuth();
  const { setActivePopup }                      = usePopup();

  const backendOrigin   = computeBackendOrigin();
  const resolveMediaUrl = v => {
    if (!v || typeof v !== 'string') return v;
    if (v.startsWith('/uploads/') || v.startsWith('/public/')) return `${backendOrigin}${v}`;
    return v;
  };

  const mergePrefs = (base, inc) => ({
    ...base, ...(inc || {}),
    gameplay:      { ...base.gameplay,      ...(inc?.gameplay || {}) },
    privacy:       { ...base.privacy,       ...(inc?.privacy || {}) },
    accessibility: { ...base.accessibility, ...(inc?.accessibility || {}) },
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab    = params.get('tab');
    const valid  = ['overview','quizzes','achievements','history','settings'];
    if (tab && valid.includes(tab)) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => () => { if (prefsMsgTimerRef.current) window.clearTimeout(prefsMsgTimerRef.current); }, []);

  useEffect(() => {
    try {
      // 1. D'abord charger depuis l'utilisateur s'il a des préférences en BDD
      if (user?.preferences) {
        const userPrefs = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
        setPrefs(mergePrefs(DEFAULT_PREFS, userPrefs));
      } else {
        // 2. Sinon fallback sur localStorage
        const r = localStorage.getItem(PREFS_KEY);
        if (r) setPrefs(mergePrefs(DEFAULT_PREFS, JSON.parse(r)));
      }
    } catch (e) {
      console.error("Erreur chargement prefs:", e);
    } finally {
      setPrefsReady(true);
    }
  }, [user]);

  useEffect(() => {
    if (!prefsReady || !user?.user_id) return;
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      setPrefsSavedAt(Date.now());
      
      if (prefsTouchedRef.current) {
        setPrefsUiMessage('Sauvegardé...');
        
        // On synchronise avec le backend (debounced simple via timeout si on veut éviter trop d'appels, 
        // mais ici on va le faire directement pour la simplicité ou on peut ajouter un debounce)
        const syncBackend = async () => {
          try {
            await authService.putUserById(user.user_id, { preferences: prefs });
            setPrefsUiMessage('Paramètres sauvegardés.');
          } catch (e) {
            console.error("Erreur sync backend prefs:", e);
            setPrefsUiMessage('Erreur synchro.');
          }
        };

        if (prefsMsgTimerRef.current) window.clearTimeout(prefsMsgTimerRef.current);
        prefsMsgTimerRef.current = window.setTimeout(() => {
          syncBackend();
          setTimeout(() => setPrefsUiMessage(''), 2500);
        }, 1000); // Debounce de 1s
      }
    } catch {}
  }, [prefs, prefsReady, user?.user_id]);

  useEffect(() => {
    document.title = 'FUNQUIZ | Mon profil';
    if (user) setEditData({ name: user.name || user.username || '', first_name: user.first_name || '', email: user.email || '', number: user.number || '' });
  }, [user]);

  useEffect(() => {
    if (showOtpPopup && user?.number) {
      verification.sendOtp(user.number).then(() => setStatus('sent')).catch(e => {
        setStatus('error'); window.alert('❌ ' + (e?.response?.data?.error || "Erreur d'envoi."));
      });
    }
  }, [showOtpPopup, user?.number]);

  useEffect(() => {
    let dead = false;
    const go = async () => {
      if (!user?.user_id) return;
      try { const d = await pointService.getUserPoints(user.user_id); if (!dead) setUserPoints(d || null); }
      catch { if (!dead) setUserPoints(null); }
    };
    go(); window.addEventListener('points:updated', go);
    return () => { dead = true; window.removeEventListener('points:updated', go); };
  }, [user?.user_id]);

  useEffect(() => {
    let dead = false;
    const go = async () => {
      if (!user?.user_id) return; setHistoryLoading(true);
      try { const l = await quizSessionService.getUserSessions(user.user_id); if (!dead) setQuizHistory(Array.isArray(l) ? l : []); }
      catch { if (!dead) setQuizHistory([]); }
      finally { if (!dead) setHistoryLoading(false); }
    };
    go(); return () => { dead = true; };
  }, [user?.user_id]);

  const handlePrefChange = (path, value) => {
    prefsTouchedRef.current = true;
    setPrefs(prev => {
      const next = { ...prev }; const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) { obj[keys[i]] = { ...obj[keys[i]] }; obj = obj[keys[i]]; }
      obj[keys[keys.length - 1]] = value; return next;
    });
  };

  const resetPrefs = () => {
    try { localStorage.removeItem(PREFS_KEY); } catch {}
    setPrefs(DEFAULT_PREFS); setPrefsUiMessage('Réinitialisés.');
    if (prefsMsgTimerRef.current) window.clearTimeout(prefsMsgTimerRef.current);
    prefsMsgTimerRef.current = window.setTimeout(() => setPrefsUiMessage(''), 2500);
  };

  const handleDeleteAccount = async () => {
    if (!user?.user_id) { alert('Utilisateur non identifié.'); return; }
    if (!deleteReason) { alert('Veuillez sélectionner une raison.'); return; }
    if (confirmText.trim() !== 'SUPPRIMER') { alert('Veuillez taper "SUPPRIMER" pour confirmer.'); return; }
    setDeleting(true);
    try {
      const res = await authService.deleteUserSoft({ user_id: user.user_id, reason: deleteReason, comment: deleteComment });
      alert(res?.message || 'Compte supprimé.'); if (logout) logout(); navigate('/');
    } catch (e) { alert(e.message || 'Erreur.'); }
    finally { setDeleting(false); }
  };

  const handleVerify = async () => {
    if (!otpCode.trim()) { setStatus('error'); window.alert('Veuillez entrer un code.'); return; }
    setStatus('pending');
    try {
      const res = await verification.verifyOtp(user.number, otpCode.trim());
      if (res?.verified || res?.success) {
        setStatus('success'); setActiveOtp(false); setShowOtpPopup(false); setAlert0(true); setOtpCode('');
        if (refreshUser) await refreshUser(); window.alert('✅ Numéro vérifié !'); window.location.reload();
      } else { setStatus('error'); window.alert('❌ Code incorrect.'); }
    } catch (e) { setStatus('error'); window.alert('❌ ' + (e?.response?.data?.message || e.message || 'Erreur.')); }
  };

  const handleResumeSession = async session => {
    const sid = session.session_id ?? session.id; setResumingId(sid);
    try {
      const thematics = await thematicService.getAllThematics();
      const thematic  = thematics.find(t => Number(t.thematic_id) === Number(session.thematic_id));
      if (!thematic) return;
      const sub = thematic.sub_thematics?.find(st => Number(st.sub_thematic_id ?? st.id) === Number(session.sub_thematic_id));
      navigate('/step', { state: { questions: sub?.questions || thematic.questions || [], subTitle: sub?.title || thematic.thematic_title || '', thematicTitle: thematic.thematic_title || '' } });
    } catch {}
    finally { setResumingId(null); }
  };

  const isCompleted = s => Number(s?.is_completed) === 1;

  const userInfo = {
    username:  user?.name || '',
    firstname: user?.first_name || '',
    email:     user?.email || '',
    number:    user?.number || '',
    is_verify: user?.is_verify ?? 0,
    joinDate:  user?.joinDate || user?.created_at || user?.createdAt || null,
    avatar:    resolveMediaUrl(user?.avatar || user?.avatar_url || ''),
  };

  const level          = Number(userPoints?.level)                 || Number(user?.level)          || 1;
  const xpInLevel      = Number(userPoints?.xp_in_level)           || 0;
  const levelSpan      = Number(userPoints?.level_span)            || 100;
  const totalQuizzes   = Number(userPoints?.total_games_played)    || Number(user?.totalQuizzes)   || 0;
  const correctAnswers = Number(userPoints?.total_correct_answers) || Number(user?.correctAnswers) || 0;
  const streak         = Number(userPoints?.current_streak)        || Number(user?.streak)         || 0;
  const totalPoints    = Number(userPoints?.total_points) || Number(userPoints?.total_points_games) || Number(user?.total_points) || 0;
  const progressPct    = Math.max(0, Math.min(100, levelSpan ? Math.round((xpInLevel / levelSpan) * 100) : 0));
  const displayName    = prefs.privacy.hideUsername ? 'Utilisateur' : `${userInfo.firstname} ${userInfo.username}`.trim() || 'Joueur';

  /* ─────── TAB CONTENT ─────── */
  const renderTabContent = () => {

    /* OVERVIEW */
    if (activeTab === 'overview') {
      const hint = correctAnswers >= 200 ? 'Excellent rythme, continue comme ça !'
        : correctAnswers >= 100 ? 'Super progression, vise les 200 réponses correctes.'
        : 'Commence par des quiz courts et réguliers pour progresser.';

      return (
        <div className="space-y-5">
          {/* Hero */}
          <div className={`${card} p-6 flex flex-col sm:flex-row items-center gap-5`}>
            <div className="relative shrink-0">
              <img src={userInfo.avatar || userIcon} alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-200"
                onError={e => { e.target.onerror = null; e.target.src = userIcon; }} />
              <button onClick={() => setVisible(true)}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center justify-center text-sm transition-colors shadow">
                📷
              </button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{userInfo.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                {userInfo.number ? (
                  userInfo.is_verify === 0 ? (
                    <button onClick={() => setActiveOtp(true)} className={`${pill} bg-amber-50 text-amber-600 ring-1 ring-amber-200 hover:bg-amber-100 transition-colors cursor-pointer`}>
                      📱 {userInfo.number} · Non vérifié ⚠️
                    </button>
                  ) : (
                    <span className={`${pill} bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200`}>📱 {userInfo.number} · Vérifié ✓</span>
                  )
                ) : user?.google_id ? (
                  <button onClick={() => setActivePopup('addNumber')} className={`${pill} bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer`}>
                    + Ajouter un numéro
                  </button>
                ) : null}
                <span className={`${pill} bg-slate-100 text-slate-500`}>
                  📅 Membre depuis {userInfo.joinDate ? new Date(userInfo.joinDate).toLocaleDateString('fr-FR') : '—'}
                </span>
              </div>
            </div>
            <button onClick={() => setVisible(true)} className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-sm">
              Modifier le profil
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🪙', label: 'Points totaux',  value: totalPoints.toLocaleString('fr-FR'), bg: 'bg-violet-50',  iconBg: 'bg-violet-100' },
              { icon: '📊', label: 'Quiz joués',      value: totalQuizzes,                        bg: 'bg-blue-50',    iconBg: 'bg-blue-100' },
              { icon: '🔥', label: 'Série actuelle',  value: streak,                              bg: 'bg-orange-50',  iconBg: 'bg-orange-100' },
              { icon: '⭐', label: `Niveau ${level}`, value: `${progressPct}%`, bar: true,        bg: 'bg-emerald-50', iconBg: 'bg-emerald-100' },
            ].map(({ icon, label, value, bg, iconBg, bar }) => (
              <div key={label} className={`rounded-2xl border border-slate-200 ${bg} p-4 shadow-sm`}>
                <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center text-lg mb-3`}>{icon}</div>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                {bar && <div className="mt-2 h-1.5 rounded-full bg-slate-200"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPct}%` }} /></div>}
              </div>
            ))}
          </div>

          {/* XP bar */}
          <div className={`${card} p-4 flex items-center gap-4`}>
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-700 font-medium">XP — Niveau {level}</span>
                <span className="text-slate-400">{xpInLevel} / {levelSpan}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="font-semibold text-slate-800">Activité récente</span>
              <button onClick={() => setActiveTab('history')} className="text-xs text-indigo-600 hover:text-indigo-500 transition-colors">Voir tout →</button>
            </div>
            {quizHistory.length === 0
              ? <p className="text-slate-400 text-sm px-5 py-6">Aucune activité récente.</p>
              : <div className="divide-y divide-slate-100">
                  {quizHistory.slice(0, 3).map((s, i) => (
                    <div key={s.session_id ?? s.id ?? i} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm">📝</div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">Session #{s.session_id ?? s.id}</div>
                          <div className="text-xs text-slate-400">{s.last_activity ? new Date(s.last_activity).toLocaleString('fr-FR') : '—'}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ScoreBadge score={s.current_score ?? s.score ?? 0} />
                        <StatusBadge completed={isCompleted(s)} />
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* Tip */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 flex gap-3 items-start shadow-sm">
            <span className="text-lg shrink-0">💡</span>
            <div>
              <div className="text-sm font-semibold text-indigo-700 mb-0.5">Conseil</div>
              <div className="text-sm text-indigo-600/80">{hint}</div>
            </div>
          </div>
        </div>
      );
    }

    /* QUIZZES */
    if (activeTab === 'quizzes') {
      const items = quizHistory
        .filter(s => { const c = isCompleted(s); return quizFilter === 'en_cours' ? !c : quizFilter === 'termine' ? c : true; })
        .filter(s => `${s.session_id ?? s.id ?? ''} ${s.last_activity ?? ''}`.toLowerCase().includes(quizQuery.trim().toLowerCase()))
        .slice(0, 20);

      return (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Mes Quiz</h2>
          <div className="flex flex-wrap gap-3">
            <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 gap-0.5 shadow-sm">
              {[['all','Tous'],['en_cours','En cours'],['termine','Terminés']].map(([v,l]) => (
                <button key={v} onClick={() => setQuizFilter(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${quizFilter === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {l}
                </button>
              ))}
            </div>
            <input className="flex-1 min-w-[180px] bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              placeholder="Rechercher..." value={quizQuery} onChange={e => setQuizQuery(e.target.value)} />
          </div>
          <div className={`${card} overflow-hidden`}>
            {items.length === 0
              ? <p className="text-slate-400 text-sm px-5 py-8 text-center">Aucun résultat.</p>
              : <div className="divide-y divide-slate-100">
                  {items.map((s, i) => (
                    <div key={s.session_id ?? s.id ?? i} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm">📝</div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">Session #{s.session_id ?? s.id}</div>
                          <div className="text-xs text-slate-400">{s.last_activity ? new Date(s.last_activity).toLocaleString('fr-FR') : '—'}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ScoreBadge score={s.current_score ?? s.score ?? 0} />
                        <StatusBadge completed={isCompleted(s)} />
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      );
    }

    /* ACHIEVEMENTS */
    if (activeTab === 'achievements') {
      const badges = [
        { key: 'level5',     emoji: '🛡️', name: 'Pilote',    desc: 'Atteindre le niveau 5',  unlocked: level >= 5 },
        { key: 'quizzes10',  emoji: '📚', name: 'Assidu',    desc: '10 quiz joués',           unlocked: totalQuizzes >= 10 },
        { key: 'streak5',    emoji: '🔥', name: 'En série',  desc: 'Série de 5 jours',        unlocked: streak >= 5 },
        { key: 'correct100', emoji: '🎓', name: 'Érudit',    desc: '100 réponses correctes',  unlocked: correctAnswers >= 100 },
      ];
      return (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Succès</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map(b => (
              <div key={b.key} className={`rounded-2xl border p-4 flex items-center gap-4 shadow-sm transition-all ${b.unlocked ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50 opacity-60 grayscale'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${b.unlocked ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>{b.emoji}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{b.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{b.desc}</div>
                  <span className={`mt-1.5 inline-block text-xs font-medium ${b.unlocked ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {b.unlocked ? '✓ Débloqué' : 'Verrouillé'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 flex gap-3 items-start shadow-sm">
            <span className="text-lg">🎯</span>
            <div>
              <div className="text-sm font-semibold text-indigo-700 mb-0.5">Prochain objectif</div>
              <div className="text-sm text-indigo-600/80">{badges.find(b => !b.unlocked)?.desc || 'Tous les objectifs atteints !'}</div>
            </div>
          </div>
        </div>
      );
    }

    /* HISTORY */
    if (activeTab === 'history') {
      return (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Historique</h2>
          <div className={`${card} overflow-hidden`}>
            {historyLoading
              ? <div className="px-5 py-10 text-center text-slate-400 text-sm">Chargement...</div>
              : quizHistory.length === 0
              ? <div className="px-5 py-10 text-center text-slate-400 text-sm">Aucun historique pour le moment.</div>
              : <div className="divide-y divide-slate-100">
                  {quizHistory.slice(0, 15).map((s, i) => {
                    const completed = isCompleted(s);
                    const sid       = s.session_id ?? s.id;
                    const isLoading = resumingId === sid;
                    return (
                      <div key={sid ?? i} onClick={!completed ? () => handleResumeSession(s) : undefined}
                        className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors ${!completed ? 'cursor-pointer' : ''}`}>
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-sm shrink-0">📝</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {s.thematic_title || `Session #${sid}`}
                            {s.sub_thematic_title && <span className="text-slate-400"> · {s.sub_thematic_title}</span>}
                          </div>
                          <div className="text-xs text-slate-400">{s.last_activity ? new Date(s.last_activity).toLocaleString('fr-FR') : '—'}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          <span className={`${pill} bg-slate-100 text-slate-500`}>✓ {s.correct_answers_count ?? 0}</span>
                          <ScoreBadge score={s.current_score ?? s.score ?? 0} />
                          <StatusBadge completed={completed} />
                          {!completed && (
                            <button onClick={e => { e.stopPropagation(); handleResumeSession(s); }} disabled={isLoading}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm">
                              {isLoading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '▶ Reprendre'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>
        </div>
      );
    }

    /* SETTINGS */
    if (activeTab === 'settings') {
      return (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Paramètres</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

            <div className={`${card} p-5 space-y-4`}>
              <div className="text-sm font-semibold text-slate-800">Apparence</div>
              <div><label className={labelCls}>Thème</label>
                <select className={selectCls} value={prefs.theme} onChange={e => handlePrefChange('theme', e.target.value)}>
                  <option value="system">Système</option><option value="light">Clair</option><option value="dark">Sombre</option>
                </select>
              </div>
              <div><label className={labelCls}>Couleur d&apos;accent</label>
                <select className={selectCls} value={prefs.accent} onChange={e => handlePrefChange('accent', e.target.value)}>
                  <option value="blue">Bleu</option><option value="purple">Violet</option><option value="green">Vert</option><option value="orange">Orange</option>
                </select>
              </div>
            </div>

            <div className={`${card} p-5 space-y-4`}>
              <div className="text-sm font-semibold text-slate-800">Jeu</div>
              <div><label className={labelCls}>Difficulté</label>
                <select className={selectCls} value={prefs.gameplay.defaultDifficulty} onChange={e => handlePrefChange('gameplay.defaultDifficulty', e.target.value)}>
                  <option value="easy">Facile</option><option value="normal">Normal</option><option value="hard">Difficile</option>
                </select>
              </div>
              {[['timer','Minuteur'],['hints','Aides']].map(([k,l]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{l}</span>
                  <Toggle checked={prefs.gameplay[k]} onChange={v => handlePrefChange(`gameplay.${k}`, v)} />
                </div>
              ))}
            </div>

            <div className={`${card} p-5 space-y-4`}>
              <div className="text-sm font-semibold text-slate-800">Confidentialité</div>
              <div>
                <label className={labelCls}>Visibilité</label>
                <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 gap-0.5">
                  {[['public','Public'],['friends','Amis'],['private','Privé']].map(([v,l]) => (
                    <button key={v} type="button" onClick={() => handlePrefChange('privacy.visibility', v)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${prefs.privacy.visibility === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {[['leaderboardOptIn','Classements'],['hideUsername','Masquer pseudo']].map(([k,l]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{l}</span>
                  <Toggle checked={prefs.privacy[k]} onChange={v => handlePrefChange(`privacy.${k}`, v)} />
                </div>
              ))}
            </div>

            <div className={`${card} p-5 space-y-4 sm:col-span-2 xl:col-span-3`}>
              <div className="text-sm font-semibold text-slate-800">Accessibilité</div>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex-1 min-w-[160px]">
                  <label className={labelCls}>Taille du texte</label>
                  <select className={selectCls} value={String(prefs.accessibility.fontScale)} onChange={e => handlePrefChange('accessibility.fontScale', Number(e.target.value))}>
                    {['0.9','1.0','1.1','1.2','1.3','1.4'].map(v => <option key={v} value={v}>{v}x</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[160px] flex items-center justify-between">
                  <span className="text-sm text-slate-700">Réduire animations</span>
                  <Toggle checked={prefs.accessibility.reduceMotion} onChange={v => handlePrefChange('accessibility.reduceMotion', v)} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-400">
              {prefsUiMessage || (prefsSavedAt ? `Sauvegardé à ${new Date(prefsSavedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ' ')}
            </span>
            <button onClick={resetPrefs} className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors">Réinitialiser</button>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-red-600">
              <CgDanger size={18} />
              <span className="font-semibold text-sm">Zone de danger</span>
            </div>
            <p className="text-sm text-slate-600">La suppression est définitive. Vous perdrez tout votre historique et vos points.</p>
            {!isDelete ? (
              <button onClick={() => setDelete(true)}
                className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium border border-red-200 transition-colors">
                Supprimer mon compte
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Raison</label>
                  <select className={`${selectCls} focus:ring-red-400`} value={deleteReason} onChange={e => setDeleteReason(e.target.value)}>
                    <option value="">-- Choisir --</option>
                    <option value="boring">Je m&apos;ennuie</option>
                    <option value="reset">Recommencer à zéro</option>
                    <option value="privacy">Confidentialité</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <input className={`${inputCls} focus:ring-red-400`} placeholder="Commentaire (optionnel)" value={deleteComment} onChange={e => setDeleteComment(e.target.value)} />
                <p className="text-sm text-slate-600">Tapez <strong className="text-red-600">SUPPRIMER</strong> pour confirmer.</p>
                <input className={`${inputCls} border-red-200 focus:ring-red-400`} placeholder="SUPPRIMER" value={confirmText} onChange={e => setConfirmText(e.target.value)} />
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setDelete(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:border-slate-300 hover:text-slate-800 transition-colors">Annuler</button>
                  <button onClick={handleDeleteAccount} disabled={confirmText !== 'SUPPRIMER' || !deleteReason || deleting}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors shadow-sm">
                    {deleting ? 'Suppression...' : 'Confirmer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  /* ─── loading / unauth ─── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
  if (!user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">Utilisateur non connecté</div>
  );

  /* ─── render ─── */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      {/* Mobile top-bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shadow-sm">
        <span className="font-bold text-sm text-slate-900">FUNQUIZ</span>
        <button onClick={() => setSidebarOpen(o => !o)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-49px)] lg:min-h-screen">

        {/* SIDEBAR */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 shrink-0 flex flex-col
          bg-white border-r border-slate-200 shadow-sm
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}>
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img src={userInfo.avatar || userIcon} alt="avatar"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-100 shrink-0"
                onError={e => { e.target.onerror = null; e.target.src = userIcon; }} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">{displayName}</div>
                <div className="text-xs text-slate-400 truncate">{userInfo.email}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV.map(n => (
              <button key={n.id} onClick={() => { setActiveTab(n.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
                  ${activeTab === n.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                <span>{n.icon}</span>{n.label}
              </button>
            ))}
            <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
              <button onClick={() => { setVisible(true); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left">
                <span>✏️</span> Modifier le profil
              </button>
              {userInfo.is_verify === 0 && userInfo.number && (
                <button onClick={() => { setActiveOtp(true); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-amber-600 hover:bg-amber-50 transition-colors text-left">
                  <span>📱</span> Vérifier le numéro
                </button>
              )}
            </div>
          </nav>

          <div className="p-3 border-t border-slate-100 space-y-1">
            {['moderator','admin'].includes(user?.role) && (
              <button onClick={() => navigate('/dashboard')}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-orange-500 hover:bg-orange-50 transition-colors text-left">
                <GiFireDash size={14} /> Dashboard
              </button>
            )}
            <button onClick={async () => { await logout(); window.location.href = '/login'; }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
              <span>→</span> Déconnexion
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 overflow-y-auto p-5 lg:p-8 max-w-5xl">
          {renderTabContent()}
        </main>
      </div>

      {/* TOASTS */}
      {(successMsg || errorMsg) && (
        <div className="fixed bottom-5 right-5 z-50 space-y-2">
          {successMsg && <div className="px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-xl">✓ {successMsg}</div>}
          {errorMsg   && <div className="px-4 py-3 rounded-xl bg-red-600    text-white text-sm font-medium shadow-xl">✕ {errorMsg}</div>}
        </div>
      )}

      {/* OTP MODAL */}
      {activeOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          {alert0 && (
            <div className={`w-full max-w-sm ${card} p-6`}>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Vérification requise</h2>
              <p className="text-sm text-slate-500 mb-6">Vous devez vérifier votre numéro pour accéder à certaines fonctionnalités.</p>
              <div className="flex gap-3">
                <button onClick={() => { setActiveOtp(false); setAlert0(true); setShowOtpPopup(false); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm hover:text-slate-800 hover:border-slate-300 transition-colors">
                  Annuler
                </button>
                <button onClick={() => { setAlert0(false); setShowOtpPopup(true); }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-sm">
                  Vérifier
                </button>
              </div>
            </div>
          )}
          {showOtpPopup && (
            <div className={`w-full max-w-sm ${card} p-6`}>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Code de vérification</h2>
              <p className="text-sm text-slate-500 mb-5">Code envoyé au <span className="text-indigo-600 font-medium">+{userInfo.number}</span></p>
              <input type="text" maxLength={6}
                className="w-full text-center text-2xl tracking-[0.5em] font-mono bg-slate-50 border border-slate-200 rounded-xl py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-5"
                placeholder="••••••" value={otpCode} onChange={e => setOtpCode(e.target.value)} />
              {status === 'sent'    && <p className="text-xs text-emerald-600 text-center mb-3">Code envoyé !</p>}
              {status === 'error'   && <p className="text-xs text-red-600 text-center mb-3">Erreur, réessayez.</p>}
              {status === 'pending' && <p className="text-xs text-indigo-600 text-center mb-3">Vérification...</p>}
              <div className="flex gap-3">
                <button onClick={() => { setActiveOtp(false); setShowOtpPopup(false); setAlert0(true); setOtpCode(''); setStatus(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm hover:text-slate-800 hover:border-slate-300 transition-colors">
                  Annuler
                </button>
                <button onClick={handleVerify} disabled={status === 'pending'}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm">
                  {status === 'pending' ? 'Vérification...' : 'Vérifier'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg ${card} overflow-y-auto max-h-[90vh]`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900">Modifier le profil</h2>
                <p className="text-xs text-slate-400 mt-0.5">Mettez à jour vos informations personnelles.</p>
              </div>
              <button onClick={() => setVisible(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-lg transition-colors">
                ×
              </button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault(); setUploading(true);
              try {
                if (selectedFile) await uploadAvatar(user.user_id, selectedFile);
                await authService.putUserById(user.user_id, editData);
                setUploading(false); setVisible(false); setSelectedFile(null); setPreviewUrl(null);
                setSuccessMsg('Profil mis à jour !'); setErrorMsg('');
                if (refreshUser) await refreshUser();
                setTimeout(() => window.location.reload(), 800);
              } catch { setUploading(false); setErrorMsg('Erreur lors de la sauvegarde.'); setSuccessMsg(''); }
            }} className="p-6 space-y-5">

              <div className="grid grid-cols-2 gap-4">
                {[['Nom','name','text'],['Prénom(s)','first_name','text'],['Email','email','email'],['Téléphone','number','text']].map(([label, key, type]) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input type={type} className={inputCls} value={editData[key]} onChange={e => setEditData({ ...editData, [key]: e.target.value })} />
                  </div>
                ))}
              </div>

              <div>
                <label className={labelCls}>Photo de profil (.webp)</label>
                <input id="profileWebp" type="file" accept="image/webp" className="sr-only"
                  onChange={e => { const f = e.target.files?.[0]; setSelectedFile(f || null); setPreviewUrl(f ? URL.createObjectURL(f) : null); }} />
                {!previewUrl ? (
                  <label htmlFor="profileWebp"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-colors">
                    <span className="text-2xl">📷</span>
                    <div>
                      <div className="text-sm text-slate-700">Choisir une image</div>
                      <div className="text-xs text-slate-400">Format WebP recommandé</div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <img src={previewUrl} alt="Preview" className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex gap-2">
                      <label htmlFor="profileWebp" className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs cursor-pointer transition-colors">Changer</label>
                      <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                        className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs transition-colors">Supprimer</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link to="/reset" className="text-xs text-indigo-600 hover:text-indigo-500 underline transition-colors">Mot de passe oublié ?</Link>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setVisible(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:border-slate-300 hover:text-slate-800 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={uploading}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm">
                    {uploading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
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