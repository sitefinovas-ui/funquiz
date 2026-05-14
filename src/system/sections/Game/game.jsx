import './game.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Loading from '../../components/Loading/loading.jsx';
import quizSessionService from '../../configurations/Services/quizSessionService.js';
import authService from '../../configurations/Services/authServices.js';
import thematicService from '../../configurations/Services/thematicServices.js';
import subThematicServices from '../../configurations/Services/subThematicServices.js';
import quizAnswerService from '../../configurations/Services/quizAnswerService.js';
import { usePopup } from '../../configurations/Context/PopupContext.jsx';

const TIMER_SECS       = 30;
const LETTERS          = ['A', 'B', 'C', 'D'];
const MAX_HEARTS       = 3;
const TIMER_CIRCUMF    = 276.46; // 2π×44

/* ─── helpers ─── */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const normalize = (s) =>
  s ? s.toString().trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : '';

const shuffleAnswers = (question) => {
  if (!question?.answers?.[0]) return question;
  const obj = question.answers[0];
  const correctOpt = Number(obj.correct_option);
  const keys = Object.keys(obj).filter(k => k.startsWith('answer_option'));
  const answers = keys.map((k, i) => ({ text: obj[k], originalIndex: i + 1, isCorrect: (i + 1) === correctOpt }));
  const shuffled = shuffle(answers);
  const newCorrect = shuffled.findIndex(a => a.isCorrect) + 1;
  const newObj = { correct_option: newCorrect };
  shuffled.forEach((a, i) => { newObj[`answer_option_${i + 1}`] = a.text; });
  return { ...question, answers: [newObj], answer_order: shuffled.map(a => a.originalIndex) };
};

const QuizComponent = () => {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { openPopup } = usePopup();
  const { questions = [], subTitle = '', thematicTitle = '' } = location.state || {};

  /* ── state ── */
  const [quitOpen,        setQuitOpen]        = useState(false);
  const [currentIndex,    setCurrentIndex]    = useState(0);
  const [selectedAnswer,  setSelectedAnswer]  = useState(null);
  const [score,           setScore]           = useState(0);
  const [isValidated,     setIsValidated]     = useState(false);
  const [userId,          setUserId]          = useState(null);
  const [sessionId,       setSessionId]       = useState(null);
  const sessionIdRef = useRef(null);
  const [answered,        setAnswered]        = useState([]);
  const [orderedQuestions,setOrderedQ]        = useState([]);

  const [timeLeft,  setTimeLeft]  = useState(TIMER_SECS);
  const [streak,    setStreak]    = useState(0);
  const [hearts,    setHearts]    = useState(MAX_HEARTS);
  const [gameOver,  setGameOver]  = useState(false);
  const [xpKey,     setXpKey]     = useState(0);
  const [showXp,    setShowXp]    = useState(false);
  const [feedback,  setFeedback]  = useState(null); // null | 'correct' | 'wrong'
  const [correctText, setCorrectText] = useState('');

  const timerRef = useRef(null);

  /* ── session init ── */
  const resolveIds = useCallback(async () => {
    const thematics = await thematicService.getAllParamThematics();
    const arrT = Array.isArray(thematics) ? thematics : thematics?.data || [];
    const tFound = arrT.find(t => normalize(t.title) === normalize(thematicTitle));
    const tId = tFound?.thematic_id ?? tFound?.id ?? null;
    if (!tId) return { tId: null, stId: null };
    const subs = await subThematicServices.getAll(tId);
    const arrS = Array.isArray(subs) ? subs : subs?.data || [];
    const sFound = arrS.find(s => normalize(s.title) === normalize(subTitle));
    const stId = sFound?.sub_thematic_id ?? sFound?.id ?? null;
    return { tId, stId };
  }, [thematicTitle, subTitle]);

  const computeCorrectCount = (list) =>
    list.reduce((acc, a) => {
      const q = questions.find(x => x.question_id === a.questionId) || {};
      return acc + (Number(a.selectedOption) === Number(q?.answers?.[0]?.correct_option) ? 1 : 0);
    }, 0);

  const saveProgress = async (answeredList, scoreValue, qIdx, completed = false) => {
    const sid = sessionIdRef.current || sessionId;
    if (!sid) return;
    try {
      await quizSessionService.updateSession(sid, {
        current_question_index: qIdx,
        answered_questions: answeredList,
        current_score: scoreValue,
        correct_answers_count: computeCorrectCount(answeredList),
        is_completed: completed ? 1 : 0,
      });
    } catch (e) { console.error(e?.message); }
  };

  useEffect(() => {
    document.title = 'FUNQUIZ | Session de jeu';
    (async () => {
      try {
        const me = await authService.getCurrentUser();
        const uid = me?.user_id ?? me?.id;
        setUserId(uid);
        if (!uid) return;
        const { tId, stId } = await resolveIds();
        if (!tId) return;
        const sessions = await quizSessionService.getUserSessions(uid);
        const target =
          sessions.find(s => {
            if (Number(s.is_completed) === 1) return false;
            const sameT  = Number(s.thematic_id) === Number(tId);
            const sameST = stId ? Number(s.sub_thematic_id) === Number(stId) : true;
            return sameT && sameST;
          }) || sessions.find(s => Number(s.is_completed) === 0);

        if (target) {
          let orderIds = null;
          try {
            const sd = typeof target.session_data === 'string' ? JSON.parse(target.session_data || '{}') : target.session_data || {};
            if (Array.isArray(sd?.question_order)) orderIds = sd.question_order;
            const savedShuffled = sd?.shuffled_questions || null;
            const reordered = (orderIds || []).map(id => (questions || []).find(q => q.question_id === id)).filter(Boolean);
            setOrderedQ(savedShuffled?.length ? savedShuffled : reordered.map(q => shuffleAnswers(q)));
          } catch { setOrderedQ(questions.map(q => shuffleAnswers(q))); }
          setSessionId(target.session_id);
          sessionIdRef.current = target.session_id;
          const prev = (() => { try { return JSON.parse(target.answered_questions || '[]'); } catch { return []; } })();
          setAnswered(prev);
          setCurrentIndex(Math.min(Math.max(Number(target.current_question_index || 0), 0), Math.max((questions || []).length - 1, 0)));
          setScore(Number(target.current_score || 0));
        } else {
          const shuffled = shuffle(questions || []);
          const withA = shuffled.map(q => shuffleAnswers(q));
          setOrderedQ(withA);
          const orderIds = shuffled.map(q => q.question_id);
          const res = await quizSessionService.createSession({
            user_id: uid, thematic_id: tId, sub_thematic_id: stId || null,
            total_questions: (questions || []).length, difficulty_level: null,
            session_data: { thematicTitle, subTitle, question_order: orderIds, shuffled_questions: withA },
          });
          const newSid = res?.sessionId || null;
          setSessionId(newSid);
          sessionIdRef.current = newSid;
        }
      } catch (e) { console.warn('Session non initialisée:', e?.message); }
    })();
  }, []);

  /* ── timer ── */
  useEffect(() => {
    if (isValidated || !orderedQuestions.length) { clearInterval(timerRef.current); return; }
    setTimeLeft(TIMER_SECS);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { clearInterval(timerRef.current); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentIndex, isValidated, orderedQuestions.length]);

  useEffect(() => {
    if (timeLeft === 0 && !isValidated) handleSelectAnswer(null);
  }, [timeLeft]);

  if (!questions || questions.length === 0) return (
    <div className="gm-wrap gm-empty">
      <h2>Aucune question disponible.</h2>
      <button onClick={() => navigate(-1)} className="gm-quit-confirm" style={{ maxWidth: 200 }}>Retour</button>
    </div>
  );

  const currentQuestion = orderedQuestions[currentIndex] || questions[currentIndex];
  const totalQuestions  = orderedQuestions.length || questions.length;
  const progressPct     = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;
  const timerArc        = (timeLeft / TIMER_SECS) * TIMER_CIRCUMF;
  const isTimerDanger   = timeLeft <= 8;
  const isTimerWarning  = timeLeft <= 15 && !isTimerDanger;
  const answerKeys      = Object.keys(currentQuestion?.answers?.[0] ?? {}).filter(k => k.startsWith('answer_option'));

  const timerColor = isTimerDanger ? '#ff3b30' : isTimerWarning ? '#ff9500' : '#5c47ff';

  /* ── answer handler ── */
  const handleSelectAnswer = async (index) => {
    if (isValidated) return;
    clearInterval(timerRef.current);

    const isTimeout    = index === null;
    const correctOpt   = Number(currentQuestion.answers[0]?.correct_option);
    const isCorrect    = !isTimeout && (index + 1) === correctOpt;

    setSelectedAnswer(isTimeout ? -1 : index);
    setIsValidated(true);

    const newStreak  = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);

    if (!isCorrect) {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      if (newHearts <= 0) {
        setTimeout(() => setGameOver(true), 1000);
      }
    }

    if (isCorrect) {
      setShowXp(true);
      setXpKey(k => k + 1);
      setTimeout(() => setShowXp(false), 1000);
    }

    // Find correct answer text for feedback
    const correctKey = `answer_option_${correctOpt}`;
    setCorrectText(currentQuestion.answers[0]?.[correctKey] || '');
    setFeedback(isCorrect ? 'correct' : isTimeout ? 'wrong' : 'wrong');

    const selectedOriginal = isTimeout ? 0 : (Array.isArray(currentQuestion?.answer_order)
      ? Number(currentQuestion.answer_order[index]) : index + 1);

    const scoreNext   = score + (isCorrect ? 1 : 0);
    setScore(scoreNext);
    const answeredNext = [...answered, { questionId: currentQuestion.question_id, selectedOption: selectedOriginal }];
    setAnswered(answeredNext);

    const isLast = currentIndex + 1 >= totalQuestions;
    await saveProgress(answeredNext, scoreNext, currentIndex + 1, isLast);

    if (isLast) {
      const sid = sessionIdRef.current || sessionId;
      try { if (sid) await quizSessionService.completeSession(sid); } catch (e) { console.error(e?.message); }
      try {
        const result = await quizAnswerService.pushFinalPoints({ userId, answered: answeredNext });
        if (result?.sent > 0) window.dispatchEvent(new CustomEvent('points:updated'));
      } catch (e) { console.error(e?.message); }
      setTimeout(() => {
        openPopup('result', { sessionId, score: computeCorrectCount(answeredNext), total: totalQuestions, thematicTitle, subTitle, userId, playedAt: new Date().toISOString() });
      }, 600);
    }
  };

  const goNext = () => {
    setFeedback(null);
    setCurrentIndex(prev => Math.min(prev + 1, totalQuestions - 1));
    setSelectedAnswer(null);
    setIsValidated(false);
  };

  const handleQuit = async () => {
    try { await saveProgress(answered, score, currentIndex, false); } catch {}
    navigate('/');
  };

  return (
    <div className="gm-wrap">
      <Loading />

      {/* ── TOP BAR ── */}
      <div className="gm-topbar">
        <button onClick={() => setQuitOpen(true)} className="gm-quit-btn">
          ✕ <span className="gm-quit-label">Quitter</span>
        </button>

        <div className="gm-progress-container">
          <div className="gm-progress-track">
            <div className="gm-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="gm-progress-label">{currentIndex + 1} / {totalQuestions}</span>
        </div>

        <div className="gm-topbar-right">
          {/* Streak */}
          {streak >= 2 && (
            <div className="gm-streak" key={streak}>🔥 {streak}</div>
          )}
          {/* Combo */}
          {streak >= 3 && (
            <div className="gm-combo" key={`c${streak}`}>×{streak >= 5 ? 3 : streak >= 3 ? 2 : 1}</div>
          )}
          {/* Hearts */}
          <div className="gm-hearts">
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <span key={i} className={`gm-heart ${i >= hearts ? 'lost' : ''}`}>❤️</span>
            ))}
          </div>
          {/* Score */}
          <div className="gm-score-pill">⭐ {score}</div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="gm-content" style={{ paddingBottom: feedback ? 140 : undefined }}>

        {/* Timer */}
        <div className="gm-timer-wrap">
          <svg className="gm-timer-svg" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={timerColor} />
                <stop offset="100%" stopColor={isTimerDanger ? '#ff6b6b' : isTimerWarning ? '#ffcc00' : '#a78bfa'} />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="44" stroke="#e8eaed" strokeWidth="7" fill="none" />
            <circle
              cx="50" cy="50" r="44"
              stroke="url(#timerGrad)"
              strokeWidth="7" fill="none"
              strokeLinecap="round"
              strokeDasharray={`${timerArc} ${TIMER_CIRCUMF}`}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray .9s linear, stroke .3s ease' }}
            />
          </svg>
          <span className={`gm-timer-text${isTimerDanger ? ' danger' : isTimerWarning ? ' warning' : ''}`}>
            {timeLeft}
          </span>
        </div>

        {/* Question card */}
        <div className="gm-question-card" key={currentIndex}>
          {showXp && <div className="gm-xp-float" key={xpKey}>+1 ⭐</div>}
          <div className="gm-question-meta">
            {thematicTitle && <span className="gm-theme-pill">{thematicTitle}</span>}
            {subTitle && <span className="gm-sub-pill">{subTitle}</span>}
            <span className="gm-qnum">Q {currentIndex + 1}/{totalQuestions}</span>
          </div>
          <p className="gm-question-text">{currentQuestion?.content ?? ''}</p>
        </div>

        {/* Answers */}
        {answerKeys.length > 0 ? (
          <div className="gm-answers-grid">
            {answerKeys.map((key, i) => {
              const correctOpt    = Number(currentQuestion?.answers?.[0]?.correct_option);
              const isCorrectAns  = (i + 1) === correctOpt;
              const isSelected    = selectedAnswer === i;
              let stateClass = '';
              if (isValidated) {
                if (isCorrectAns) stateClass = 'correct';
                else if (isSelected) stateClass = 'wrong';
                else stateClass = 'dimmed';
              }
              return (
                <button
                  key={i}
                  className={`gm-answer-btn ${stateClass}`}
                  onClick={() => handleSelectAnswer(i)}
                  disabled={isValidated}
                >
                  <span className={`gm-answer-letter gm-letter-${i}`}>{LETTERS[i] ?? i + 1}</span>
                  <span className="gm-answer-text">{currentQuestion.answers[0][key]}</span>
                  {isValidated && isCorrectAns && <span className="gm-answer-icon">✓</span>}
                  {isValidated && isSelected && !isCorrectAns && <span className="gm-answer-icon">✗</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <button onClick={() => { setCurrentIndex(p => p + 1); setSelectedAnswer(null); setIsValidated(false); }} className="gm-continue-btn">
            Continuer →
          </button>
        )}
      </div>

      {/* ── FEEDBACK BAR ── */}
      {feedback && !gameOver && (
        <div className={`gm-feedback ${feedback}`}>
          <div className="gm-feedback-left">
            <span className="gm-feedback-icon">{feedback === 'correct' ? '🎉' : '💔'}</span>
            <div>
              <p className="gm-feedback-title">
                {feedback === 'correct' ? 'Bonne réponse !' : 'Mauvaise réponse'}
              </p>
              {feedback === 'wrong' && correctText && (
                <p className="gm-feedback-sub">Réponse : {correctText}</p>
              )}
              {feedback === 'correct' && streak >= 2 && (
                <p className="gm-feedback-sub">🔥 {streak} bonnes réponses d'affilée !</p>
              )}
            </div>
          </div>
          {currentIndex + 1 < totalQuestions && (
            <button className="gm-feedback-next" onClick={goNext}>
              Continuer →
            </button>
          )}
        </div>
      )}

      {/* ── GAME OVER ── */}
      {gameOver && (
        <div className="gm-gameover">
          <div className="gm-gameover-card">
            <div className="gm-gameover-icon">💔</div>
            <h2 className="gm-gameover-title">Plus de vies !</h2>
            <p className="gm-gameover-sub">
              Tu as répondu correctement à {score} question{score > 1 ? 's' : ''} sur {totalQuestions}.
              Ta progression a été sauvegardée.
            </p>
            <div className="gm-gameover-actions">
              <button className="gm-gameover-retry" onClick={() => { setHearts(MAX_HEARTS); setGameOver(false); setFeedback(null); }}>
                Continuer quand même
              </button>
              <button className="gm-gameover-quit" onClick={handleQuit}>
                Quitter la partie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QUIT DIALOG ── */}
      {quitOpen && (
        <div className="gm-quit-overlay" onClick={() => setQuitOpen(false)}>
          <div className="gm-quit-dialog" onClick={e => e.stopPropagation()}>
            <div className="gm-quit-icon">🚪</div>
            <h3 className="gm-quit-title">Quitter la partie ?</h3>
            <p className="gm-quit-sub">Ta progression sera sauvegardée. Tu pourras reprendre plus tard.</p>
            <div className="gm-quit-actions">
              <button className="gm-quit-cancel" onClick={() => setQuitOpen(false)}>Continuer</button>
              <button className="gm-quit-confirm" onClick={handleQuit}>Quitter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
