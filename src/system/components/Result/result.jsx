import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import quizSessionService from '../../configurations/Services/quizSessionService.js';
import { usePopup } from '../../configurations/Context/PopupContext.jsx';
import './result.css';

export default function ResultPopup({ closePopup }) {
  const navigate = useNavigate();
  const { popupPayload } = usePopup();
  const payload = popupPayload || {};
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentUserId = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1]))?.user_id || null; } catch { return null; }
  }, []);

  useEffect(() => {
    let ignore = false;
    const asNum = (v, def = 0) => { const n = Number(v); return Number.isFinite(n) ? n : def; };

    const refreshWithBackoff = async (sid, expectedScore) => {
      let attempts = 0;
      const tryRefresh = async () => {
        if (ignore || attempts >= 4) return;
        attempts++;
        try {
          const s = await quizSessionService.getSessionById(sid);
          const apiScore = asNum(s?.current_score ?? s?.score);
          const apiCompleted = Number(s?.is_completed) === 1;
          if (apiCompleted && apiScore >= asNum(expectedScore)) {
            if (!ignore) setSession(s);
          } else {
            setTimeout(tryRefresh, attempts * 300);
          }
        } catch { setTimeout(tryRefresh, attempts * 300); }
      };
      tryRefresh();
    };

    const load = async () => {
      try {
        setLoading(true);
        const hasBasics = Number.isFinite(Number(payload?.score)) && Number.isFinite(Number(payload?.total));
        if (hasBasics) {
          const synthetic = {
            session_id: payload.sessionId || null,
            current_score: asNum(payload.score),
            correct_answers_count: asNum(payload.score),
            total_questions: asNum(payload.total),
            last_activity: payload.playedAt || new Date().toISOString(),
            thematic_title: payload.thematicTitle,
            sub_thematic_title: payload.subTitle,
          };
          if (!ignore) { setSession(synthetic); setLoading(false); }
          if (payload.sessionId) refreshWithBackoff(payload.sessionId, payload.score);
          return;
        }
        if (payload?.sessionId) {
          const s = await quizSessionService.getSessionById(payload.sessionId);
          if (!ignore) setSession(s);
          return;
        }
        if (!currentUserId) throw new Error('Utilisateur non authentifié.');
        const sessions = await quizSessionService.getUserSessions(currentUserId);
        const completed = sessions.filter(s => Number(s.is_completed) === 1);
        const sorted = [...(completed.length ? completed : sessions)].sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity));
        if (!sorted[0]) throw new Error('Aucune session trouvée.');
        if (!ignore) setSession(sorted[0]);
      } catch (e) {
        if (!ignore) setError(e?.message || 'Erreur lors du chargement.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [payload?.sessionId, payload?.score, payload?.total, currentUserId]);

  // Animated score counter
  useEffect(() => {
    if (!session) return;
    const finalScore = Number(session?.current_score ?? session?.score ?? 0);
    if (finalScore === 0) { setDisplayScore(0); return; }
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + 1, finalScore);
      setDisplayScore(current);
      if (current >= finalScore) clearInterval(interval);
    }, 70);
    return () => clearInterval(interval);
  }, [session]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    closePopup();
    navigate('/', { replace: true });
  };

  if (loading) return createPortal(
    <div className="res-overlay">
      <div className="res-spinner-wrap">
        <div className="res-spinner" />
        <p className="res-spinner-label">Calcul des résultats…</p>
      </div>
    </div>,
    document.body
  );

  if (error) return createPortal(
    <div className="res-overlay">
      <div className="res-card">
        <button className="res-close" onClick={close}>✕</button>
        <div className="res-grade" style={{ color: '#ff4d4f' }}>!</div>
        <h2 className="res-title" style={{ color: '#fff' }}>Oups !</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '0 0 24px' }}>{error}</p>
        <button className="res-btn-home" onClick={close}>Fermer</button>
      </div>
    </div>,
    document.body
  );

  const score   = Number(session?.current_score ?? session?.score ?? 0);
  const correct = Number(session?.correct_answers_count ?? 0);
  const total   = Number(session?.total_questions ?? session?.questions_count ?? session?.max_score ?? 0);
  const percent = total > 0 ? (score / total) * 100 : 0;
  const percentFormatted = percent.toFixed(0);

  // Grade system
  let grade = 'D', gradeColor = '#ff4d4f', gradeLabel = 'Continue !', gradeEmoji = '🔥';
  if (percent >= 90)      { grade = 'S'; gradeColor = '#ffd700'; gradeLabel = 'Parfait !';   gradeEmoji = '🏆'; }
  else if (percent >= 75) { grade = 'A'; gradeColor = '#a855f7'; gradeLabel = 'Excellent !'; gradeEmoji = '⭐'; }
  else if (percent >= 60) { grade = 'B'; gradeColor = '#3b82f6'; gradeLabel = 'Très bien !'; gradeEmoji = '👍'; }
  else if (percent >= 40) { grade = 'C'; gradeColor = '#f59e0b'; gradeLabel = 'Pas mal !';  gradeEmoji = '💪'; }

  // SVG progress ring
  const r = 52;
  const circ = 2 * Math.PI * r; // 326.7
  const offset = circ - (percent / 100) * circ;

  const playedAt = session?.last_activity || session?.updated_at || session?.created_at;
  const playedDateStr = playedAt
    ? new Date(playedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
    : '—';

  const handleShare = async () => {
    const text = `🎮 FunQuiz — ${session?.thematic_title || 'Quiz'} | Score : ${score}/${total} (${percentFormatted}%) | Grade : ${grade} ${gradeEmoji} | Essaie de me battre !`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleReplay = () => { closePopup(); navigate(-1); };

  const showConfetti = percent >= 80;

  return createPortal(
    <div className="res-overlay">
      {showConfetti && (
        <div className="res-confetti-wrap" aria-hidden="true">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="res-confetti" style={{
              left: `${(i / 40) * 100}%`,
              animationDelay: `${(i * 0.07).toFixed(2)}s`,
              background: ['#ffd700','#a855f7','#3b82f6','#f313b0','#06d47b'][i % 5],
            }} />
          ))}
        </div>
      )}

      <div className="res-card">
        <button className="res-close" onClick={close}>✕</button>

        {/* Grade */}
        <div className="res-grade" style={{ color: gradeColor }}>{grade}</div>
        <p className="res-grade-label">{gradeEmoji} {gradeLabel}</p>

        {/* SVG ring + score */}
        <div className="res-ring-wrap">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={r} stroke="rgba(255,255,255,0.07)" strokeWidth="10" fill="none" />
            <circle cx="70" cy="70" r={r}
              stroke={gradeColor}
              strokeWidth="10" fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 1.4s ease, stroke 0.3s ease' }}
            />
          </svg>
          <div className="res-ring-inner">
            <span className="res-score-big">{displayScore}</span>
            <span className="res-score-sep">/</span>
            <span className="res-score-total">{total}</span>
          </div>
        </div>

        <div className="res-percent" style={{ color: gradeColor }}>{percentFormatted}%</div>

        {/* Stats */}
        <div className="res-stats">
          <div className="res-stat">
            <span className="res-stat-icon" style={{ background: 'rgba(5,184,104,0.12)', color: '#06d47b' }}>✓</span>
            <div>
              <span className="res-stat-label">Bonnes</span>
              <span className="res-stat-val">{correct}</span>
            </div>
          </div>
          <div className="res-stat">
            <span className="res-stat-icon" style={{ background: 'rgba(255,60,60,0.12)', color: '#ff7070' }}>✗</span>
            <div>
              <span className="res-stat-label">Mauvaises</span>
              <span className="res-stat-val">{total - correct}</span>
            </div>
          </div>
          <div className="res-stat">
            <span className="res-stat-icon" style={{ background: 'rgba(155,52,211,0.12)', color: '#c77dff' }}>💎</span>
            <div>
              <span className="res-stat-label">Points gagnés</span>
              <span className="res-stat-val">+{score * 10}</span>
            </div>
          </div>
        </div>

        {/* Info */}
        {session?.thematic_title && (
          <div className="res-info">
            <span className="res-info-key">Thématique</span>
            <span className="res-info-val">{session.thematic_title}</span>
            {session?.sub_thematic_title && <>
              <span className="res-info-key">Quiz</span>
              <span className="res-info-val">{session.sub_thematic_title}</span>
            </>}
            <span className="res-info-key">Date</span>
            <span className="res-info-val">{playedDateStr}</span>
          </div>
        )}

        {/* Actions */}
        <div className="res-actions">
          <button className="res-btn-share" onClick={handleShare}>
            {copied ? '✓ Copié !' : '📋 Partager'}
          </button>
          <button className="res-btn-replay" onClick={handleReplay}>🔄 Rejouer</button>
          <button className="res-btn-rank" onClick={() => { navigate('/raking', { replace: true }); closePopup(); }}>🏆 Classement</button>
          <button className="res-btn-home" onClick={close}>🏠 Accueil</button>
        </div>

        <p className="res-session">Session #{session?.session_id || '—'}</p>
      </div>
    </div>,
    document.body
  );
}
