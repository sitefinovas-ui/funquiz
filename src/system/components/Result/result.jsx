import React, { useEffect, useState, useMemo } from 'react';
import { Button, Spin, Alert, Progress } from 'antd';
import { createPortal } from 'react-dom';
import {
  TrophyOutlined,
  StarOutlined,
  ClockCircleOutlined,
  FireOutlined,
  HomeOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
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
  const [showConfetti, setShowConfetti] = useState(false);

  const currentUserId = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded?.user_id || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const asNum = (v, def = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : def;
    };

    const refreshFromServerWithBackoff = async (sid, expectedScore) => {
      let attempts = 0;
      const tryRefresh = async () => {
        if (ignore || attempts >= 4) return;
        attempts++;
        try {
          console.log(`🔄 Tentative de rafraîchissement ${attempts}/4 pour session ${sid}`);
          const s = await quizSessionService.getSessionById(sid);
          
          console.log('📥 Session reçue du serveur:', s);
          
          const apiScore = asNum(s?.current_score ?? s?.score);
          const apiTotal = asNum(s?.total_questions ?? s?.questions_count ?? s?.max_score);
          const apiCompleted = Number(s?.is_completed) === 1;

          console.log('Analyse:', {
            apiScore,
            apiTotal,
            apiCompleted,
            expectedScore: asNum(expectedScore)
          });

          if (apiCompleted && apiScore >= asNum(expectedScore)) {
            console.log('✅ Session complète et à jour, mise à jour de l\'état');
            if (!ignore) setSession(s);
          } else {
            console.log(`⏳ Session pas encore à jour, réessai dans ${attempts * 300}ms`);
            setTimeout(tryRefresh, attempts * 300);
          }
        } catch (err) {
          console.error('❌ Erreur lors du rafraîchissement:', err);
          setTimeout(tryRefresh, attempts * 300);
        }
      };
      tryRefresh();
    };

    const load = async () => {
      console.log('════════════════════════════════════════');
      console.log('🎬 DÉBUT CHARGEMENT RESULT POPUP');
      console.log('════════════════════════════════════════');
      console.log('Payload reçu:', payload);
      
      try {
        setLoading(true);

        const hasPayloadBasics =
          Number.isFinite(Number(payload?.score)) &&
          Number.isFinite(Number(payload?.total));

        console.log('✅ Payload a score et total?', hasPayloadBasics);

        if (hasPayloadBasics) {
          console.log('📦 Création de session synthétique depuis payload');
          
          const syntheticSession = {
            session_id: payload.sessionId || null,
            current_score: asNum(payload.score),
            correct_answers_count: asNum(payload.score),
            total_questions: asNum(payload.total),
            last_activity: payload.playedAt || new Date().toISOString(),
            thematic_title: payload.thematicTitle,
            sub_thematic_title: payload.subTitle,
          };

          console.log('Session synthétique créée:', syntheticSession);

          if (!ignore) {
            setSession(syntheticSession);
            setLoading(false);
          }

          if (payload.sessionId) {
            console.log('🔄 Rafraîchissement depuis serveur...');
            refreshFromServerWithBackoff(payload.sessionId, payload.score);
          }
          return;
        }

        if (payload?.sessionId) {
          console.log('📥 Récupération session depuis ID:', payload.sessionId);
          const s = await quizSessionService.getSessionById(payload.sessionId);
          console.log('Session récupérée:', s);
          if (!ignore) setSession(s);
          return;
        }

        if (!currentUserId) {
          throw new Error('Utilisateur non authentifié ou introuvable.');
        }

        console.log('👤 Récupération sessions pour user:', currentUserId);
        const sessions = await quizSessionService.getUserSessions(currentUserId);
        console.log('Sessions utilisateur:', sessions);

        const pickLatest = (arr) => {
          const sorted = [...arr].sort(
            (a, b) => new Date(b.last_activity) - new Date(a.last_activity)
          );
          return sorted[0] || null;
        };

        const completed = sessions.filter((s) => Number(s.is_completed) === 1);
        console.log('Sessions complétées:', completed);
        
        const s = pickLatest(completed.length ? completed : sessions);
        console.log('Session sélectionnée:', s);
        
        if (!s) throw new Error('Aucune session de quiz trouvée.');

        if (!ignore) setSession(s);
      } catch (e) {
        console.error('❌ ERREUR lors du chargement:', e);
        if (!ignore) setError(e?.message || 'Erreur lors du chargement du résultat.');
      } finally {
        if (!ignore) {
          setLoading(false);
          console.log('════════════════════════════════════════');
          console.log('🏁 FIN CHARGEMENT RESULT POPUP');
          console.log('════════════════════════════════════════');
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [payload?.sessionId, payload?.score, payload?.total, currentUserId]);

  // Déclencher confettis pour scores élevés
  useEffect(() => {
    if (session) {
      const score = Number(session?.current_score ?? session?.score ?? 0);
      const total = Number(
        session?.total_questions ??
        session?.questions_count ??
        session?.max_score ??
        0
      );
      const percent = total > 0 ? (score / total) * 100 : 0;
      
      console.log('🎊 Vérification confetti:', { score, total, percent });
      
      if (percent >= 80) {
        console.log('✨ Activation des confettis!');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }
  }, [session]);

  if (loading) {
    return createPortal(
      <div className="result-popup-overlay">
        <div className="result-popup-loading">
          <Spin size="large" />
          <p className="loading-text">Calcul de vos résultats...</p>
        </div>
      </div>,
      document.body
    );
  }

  const close = () => {
    if (closing) return;
    setClosing(true);
    try {
      closePopup();
    } finally {
      const redirectTo = typeof payload?.redirectTo === 'string' ? payload.redirectTo : '/';
      navigate(redirectTo, { replace: true });
    }
  };

  if (error) {
    return createPortal(
      <div className="result-popup-overlay">
        <div className="result-popup-card result-popup-error">
          <div className="result-popup-close" onClick={close}>×</div>
          <div className="error-icon">
            <CloseCircleOutlined />
          </div>
          <h2 className="error-title">Oups !</h2>
          <Alert type="error" message="Impossible d'afficher le résultat" description={error} showIcon />
          <Button type="primary" size="large" onClick={closePopup} style={{ marginTop: 24 }}>
            Fermer
          </Button>
        </div>
      </div>,
      document.body
    );
  }

  // ════════════════════════════════════════════════════
  // 🔍 CALCUL DES RÉSULTATS AVEC DEBUGGING COMPLET
  // ════════════════════════════════════════════════════

  console.log('\n════════════════════════════════════════');
  console.log('📊 CALCUL DES RÉSULTATS');
  console.log('════════════════════════════════════════');
  console.log('Session complète:', JSON.stringify(session, null, 2));

  const score = Number(session?.current_score ?? session?.score ?? 0);
  const correct = Number(session?.correct_answers_count ?? 0);
  const total = Number(
    session?.total_questions ??
    session?.questions_count ??
    session?.max_score ??
    0
  );

  console.log('\n📈 VALEURS EXTRAITES:');
  console.log('-----------------------------------');
  console.log('current_score (brut):', session?.current_score, '| Type:', typeof session?.current_score);
  console.log('score (brut):', session?.score, '| Type:', typeof session?.score);
  console.log('✅ SCORE FINAL:', score);
  console.log('-----------------------------------');
  console.log('correct_answers_count (brut):', session?.correct_answers_count, '| Type:', typeof session?.correct_answers_count);
  console.log('✅ CORRECT FINAL:', correct);
  console.log('-----------------------------------');
  console.log('total_questions (brut):', session?.total_questions, '| Type:', typeof session?.total_questions);
  console.log('questions_count (brut):', session?.questions_count, '| Type:', typeof session?.questions_count);
  console.log('max_score (brut):', session?.max_score, '| Type:', typeof session?.max_score);
  console.log('✅ TOTAL FINAL:', total);
  console.log('-----------------------------------');

  const percent = total > 0 ? (score / total) * 100 : 0;
  const percentFormatted = percent.toFixed(1);

  console.log('\n🎯 CALCULS:');
  console.log('Pourcentage brut:', percent);
  console.log('Pourcentage formaté:', percentFormatted + '%');
  console.log('Mauvaises réponses:', total - correct);

  const playedAt = session?.last_activity || session?.updated_at || session?.created_at;
  const playedDateStr = playedAt
    ? new Date(playedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
    : '—';

  console.log('\n📅 DATE:');
  console.log('last_activity:', session?.last_activity);
  console.log('updated_at:', session?.updated_at);
  console.log('created_at:', session?.created_at);
  console.log('Date affichée:', playedDateStr);

  // Déterminer le niveau de performance
  let performanceLevel = 'beginner';
  let performanceMessage = 'Continue comme ça !';
  let performanceColor = '#faad14';
  let performanceIcon = <StarOutlined />;

  if (percent >= 90) {
    performanceLevel = 'perfect';
    performanceMessage = 'Performance exceptionnelle ! 🏆';
    performanceColor = '#722ed1';
    performanceIcon = <TrophyOutlined />;
  } else if (percent >= 80) {
    performanceLevel = 'excellent';
    performanceMessage = 'Excellent travail ! 🎉';
    performanceColor = '#52c41a';
    performanceIcon = <CheckCircleOutlined />;
  } else if (percent >= 60) {
    performanceLevel = 'good';
    performanceMessage = 'Bon résultat ! 👍';
    performanceColor = '#1890ff';
    performanceIcon = <FireOutlined />;
  } else if (percent >= 40) {
    performanceLevel = 'average';
    performanceMessage = 'Pas mal, continue ! 💪';
    performanceColor = '#faad14';
    performanceIcon = <StarOutlined />;
  } else {
    performanceLevel = 'beginner';
    performanceMessage = 'Tu peux faire mieux ! 🔥';
    performanceColor = '#ff4d4f';
    performanceIcon = <FireOutlined />;
  }

  console.log('\n🎨 PERFORMANCE:');
  console.log('Niveau:', performanceLevel);
  console.log('Message:', performanceMessage);
  console.log('Couleur:', performanceColor);

  console.log('\n💡 DIAGNOSTIC:');
  if (score !== correct) {
    console.warn('⚠️ ATTENTION: score !== correct');
    console.warn('Score:', score, '| Correct:', correct);
    console.warn('Il y a probablement un problème avec correct_answers_count');
  } else {
    console.log('✅ score === correct, tout est cohérent');
  }

  if (total === 0) {
    console.error('❌ ERREUR: total === 0, impossible de calculer le pourcentage');
  }

  console.log('════════════════════════════════════════\n');

  return createPortal(
    <div className="result-popup-overlay">
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)]
            }} />
          ))}
        </div>
      )}

      <div className={`result-popup-card ${performanceLevel}`}>
        {/* Header avec icône animée */}
        <div className="result-header">
          <div className="result-icon" style={{ color: performanceColor }}>
            {performanceIcon}
          </div>
          <h2 className="result-title">Quiz Terminé !</h2>
          <p className="result-subtitle" style={{ color: performanceColor }}>
            {performanceMessage}
          </p>
        </div>

        {/* Score principal avec cercle de progression */}
        <div className="result-main-score">
          <div className="progress-circle-container">
            <Progress
              type="circle"
              percent={percent}
              format={() => (
                <div className="progress-inner">
                  <div className="score-big">{score}</div>
                  <div className="score-divider">/</div>
                  <div className="score-total">{total}</div>
                </div>
              )}
              strokeColor={{
                '0%': performanceColor,
                '100%': performanceLevel === 'perfect' ? '#722ed1' : performanceColor,
              }}
              strokeWidth={8}
              width={200}
            />
          </div>
          <div className="percent-badge" style={{ backgroundColor: performanceColor }}>
            {percentFormatted}%
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="result-stats">
          <div className="stat-item">
            <div className="stat-icon success">
              <CheckCircleOutlined />
            </div>
            <div className="stat-content">
              <span className="stat-label text-light">Bonnes réponses</span>
              <span className="stat-value">{correct}</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon error">
              <CloseCircleOutlined />
            </div>
            <div className="stat-content">
              <span className="stat-label text-light">Mauvaises réponses</span>
              <span className="stat-value">{total - correct}</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon info">
              <ClockCircleOutlined />
            </div>
            <div className="stat-content">
              <span className="stat-label text-light">Date</span>
              <span className="stat-value">{playedDateStr}</span>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        {session?.thematic_title && (
          <div className="result-info">
            <div className="info-item">
              <span className="info-label text-light">Thématique</span>
              <span className="info-value">{session.thematic_title}</span>
            </div>
            {session?.sub_thematic_title && (
              <div className="info-item">
                <span className="info-label text-light">Sous-thématique</span>
                <span className="info-value">{session.sub_thematic_title}</span>
              </div>
            )}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="result-actions">
          <Button
            type="default"
            size="large"
            icon={<HomeOutlined />}
            onClick={close}
            className="action-btn secondary"
          >
            Accueil
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<RiseOutlined />}
            onClick={() => {
              navigate('/raking', { replace: true });
              closePopup();
            }}
            className="action-btn primary"
          >
            Classement
          </Button>
        </div>

        {/* Session ID */}
        <div className="result-session-id">Session #{session?.session_id || '—'}</div>
      </div>
    </div>,
    document.body
  );
}