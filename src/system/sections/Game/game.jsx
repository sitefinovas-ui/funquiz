// imports (ajout du PopupContext)
import './game.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Loading from '../../components/Loading/loading.jsx';
import Logo from '../../../assets/Log.png';
import btnclose from '../../../assets/icons/btn-close.svg';
import quizSessionService from '../../configurations/Services/quizSessionService.js';
import authService from '../../configurations/Services/authServices.js';
import thematicService from '../../configurations/Services/thematicServices.js';
import subThematicServices from '../../configurations/Services/subThematicServices.js';
import quizAnswerService from '../../configurations/Services/quizAnswerService.js';
import pointService from '../../configurations/Services/pointService.js';
import { usePopup } from '../../configurations/Context/PopupContext.jsx';

const QuizComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openPopup } = usePopup();
  const { questions = [], subTitle = '', thematicTitle = '' } = location.state || {};

  const [isVisible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isValidated, setIsValidated] = useState(false);
  const [result, setResult] = useState(null);
  const [activePopup, setActivePopup] = useState(null);

  // états (dans le composant)
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [answered, setAnswered] = useState([]);
  const [thematicId, setThematicId] = useState(null);
  const [subThematicId, setSubThematicId] = useState(null);

  // Helpers
  const normalize = (s) =>
    s ? s.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

  const computeCorrectCount = (list) =>
    list.reduce((acc, a) => {
      const q = questions.find((x) => x.question_id === a.questionId) || {};
      const correct = q?.answers?.[0]?.correct_option;
      return acc + (a.selectedOption === correct ? 1 : 0);
    }, 0);

  // ➕ Résoudre IDs par titres
  const resolveIdsByTitles = async () => {
    const thematics = await thematicService.getAllParamThematics();
    const arrT = Array.isArray(thematics) ? thematics : thematics?.data || [];
    const tFound = arrT.find((t) => normalize(t.title) === normalize(thematicTitle));
    const tId = tFound?.thematic_id ?? tFound?.id ?? null;

    if (!tId) return { tId: null, stId: null };

    const subs = await subThematicServices.getAll(tId);
    const arrS = Array.isArray(subs) ? subs : subs?.data || [];
    const sFound = arrS.find((s) => normalize(s.title) === normalize(subTitle));
    const stId = sFound?.sub_thematic_id ?? sFound?.id ?? null;

    return { tId, stId };
  };

  // Démarrage: récupérer utilisateur, résoudre IDs, reprendre ou créer session
  useEffect(() => {
    document.title = 'FUNQUIZ | Session de jeu';
    (async () => {
      try {
        const me = await authService.getCurrentUser();
        const uid = me?.user_id ?? me?.id;
        setUserId(uid);
        if (!uid) return;
        const { tId, stId } = await resolveIdsByTitles();
        setThematicId(tId);
        setSubThematicId(stId);
        if (!tId) {
          console.warn("ID thématique introuvable pour", thematicTitle);
          return;
        }
        const sessions = await quizSessionService.getUserSessions(uid);
        const target = sessions.find((s) => {
          if (Number(s.is_completed) === 1) return false;
          const sameT = Number(s.thematic_id) === Number(tId);
          const sameST = stId ? Number(s.sub_thematic_id) === Number(stId) : true;
          return sameT && sameST;
        }) || sessions.find((s) => Number(s.is_completed) === 0);
        if (target) {
          setSessionId(target.session_id);
          const answeredPrev = (() => {
            try {
              return JSON.parse(target.answered_questions || '[]');
            } catch {
              return [];
            }
          })();
          setAnswered(answeredPrev);
          const idxRaw = Number(target.current_question_index || 0);
          const safeIndex = Math.min(Math.max(idxRaw, 0), Math.max(questions.length - 1, 0));
          setCurrentIndex(safeIndex);
          setScore(Number(target.current_score || 0));
        } else {
          const res = await quizSessionService.createSession({
            user_id: uid,
            thematic_id: tId,
            sub_thematic_id: stId || null,
            total_questions: questions.length,
            difficulty_level: null,
            session_data: { thematicTitle, subTitle },
          });
          setSessionId(res?.sessionId || null);
        }
      } catch (e) {
        console.warn('Session non initialisée:', e?.message);
      }
    })();
  }, []);

  if (!questions || questions.length === 0) {
    return (
      <div className="vh-100 vw-100 d-flex align-items-center justify-content-center">
        <h2>Aucune question disponible pour cette sous-thématique.</h2>
        <button onClick={() => navigate(-1)} className="btn btn-primary mt-3">
          Retour
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = async (index) => {
    if (isValidated) return;

    setSelectedAnswer(index);
    setIsValidated(true);

    const isCorrect = index + 1 === currentQuestion.answers[0].correct_option;
    const scoreNext = score + (isCorrect ? 1 : 0);
    setScore(scoreNext);

    const answeredNext = [
      ...answered,
      { questionId: currentQuestion.question_id, selectedOption: index + 1 },
    ];
    setAnswered(answeredNext);

    try {
      if (sessionId) {
        await quizSessionService.updateSession(sessionId, {
          current_question_index: currentIndex + 1,
          answered_questions: answeredNext,
          current_score: scoreNext,
          correct_answers_count: computeCorrectCount(answeredNext),
          is_completed: 0,
        });
      }
    } catch (e) {
      console.warn('Sauvegarde progression échouée:', e?.message);
    }

    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsValidated(false);
    } else {
      // Fin de partie: finaliser session, pousser points, ouvrir le popup externe
      const finalScore = computeCorrectCount(answered);
      try {
        if (sessionId) {
          await quizSessionService.updateSession(sessionId, {
            current_question_index: currentIndex,
            answered_questions: answered,
            current_score: finalScore,
            correct_answers_count: finalScore,
            is_completed: 1,
          });
          await quizSessionService.completeSession(sessionId);
        }

        await quizAnswerService.pushFinalPoints({
          userId,
          subThematicId,
          answered,
          questions,
        });

        window.dispatchEvent(new CustomEvent('points:updated'));
      } catch (e) {
        console.warn('Finalisation session échouée:', e?.message);
      }

      openPopup('result', {
        score: finalScore,
        total: questions.length,
        thematicTitle,
        subTitle,
        userId,
      });
    }
  };

  const handleQuit = async () => {
    try {
      if (sessionId) {
        await quizSessionService.updateSession(sessionId, {
          current_question_index: currentIndex,
          answered_questions: answered,
          current_score: score,
          correct_answers_count: computeCorrectCount(answered),
          is_completed: 0,
        });
      }
    } catch (e) {
      console.warn('Sauvegarde avant quit échouée:', e?.message);
    } finally {
      navigate('/');
    }
  };

  const getCardClass = (index) => {
    return selectedAnswer === index ? 'selected border-primary bg-custom-quiz' : 'border-secondary';
  };

  return (
    <div className="container-game vh-100 vw-100 d-flex align-items-center justify-content-center overflow-hidden">
        <Loading />
        <div className="d-flex flex-column align-items-center justify-content-center gap-4 container">
        {/* Bouton quitter */}
        <button
          onClick={() => setVisible(true)}
          className="rounded-pill position-absolute z-3 top-0 start-0 p-2 m-5 btn-quiz border-0 bg-transparent overflow-hidden"
        >
          <img src={btnclose} width={70} alt="Close button" />
        </button>

        {/* Partie gauche */}
        <div className="visio-one position-relative">
          <div className="d-flex align-items-center">
            <div style={{ width: '100px' }} className="logo">
              <img src={Logo} className="w-100 h-100" alt="" />
            </div>
            <h1 className="fw-bold text-light d-none d-lg-block">FunQuiz</h1>
          </div>

          <div className="bg-light w-100 rounded-4 p-4 overflow-hidden container-custom">
            <h2 className="fw-bold fs-md-4 fs-custom position-relative">
              Question{' '}
              <span className="fs-4 position-absolute end-0">
                {Math.min(currentIndex + 1, questions.length)}/{questions.length}
              </span>
            </h2>
            <h4 className="mt-3">{currentQuestion?.content ?? ''}</h4>
          </div>
        </div>

        {/* Partie droite */}
        <div
          style={{ width: '320px', maxHeight: '600px' }}
          className="visio-two bg-white shadow-lg rounded-4 p-4 position-relative"
        >
          {currentQuestion?.answers && currentQuestion.answers.length > 0 ? (
            <div>
              {Object.keys(currentQuestion.answers?.[0] ?? {})
                .filter((key) => key.startsWith('answer_option'))
                .map((key, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectAnswer(i)}
                    className={`quiz-btn d-flex gap-2 align-items-center mb-2 ${getCardClass(i)}`}
                  >
                    <span className="fw-bold text-uppercase letter">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{(currentQuestion.answers?.[0] ?? {})[key]}</span>
                  </button>
                ))}
            </div>
          ) : (
            <div className="d-flex justify-content-end mt-4">
              <button
                onClick={handleNext}
                className="w-100 rounded-pill py-2 border-0 btn-submit-quiz"
              >
                Continuer
              </button>
            </div>
          )}
        </div>

        {/* Popup quitter */}
        {isVisible && (
          <div className="blur bg-dark bg-opacity-50 top-0 bottom-0 left-0 right-0 position-absolute z-3 w-100 h-100 d-flex align-items-center justify-content-center">
            <div className="quit-card bg-white shadow-lg rounded-4 p-4 text-center">
              <h5 className="fw-bold mb-3">Voulez-vous quitter la partie ?</h5>
              <p className="text-muted mb-4">Votre progression sera sauvegardée.</p>
              <div className="d-flex justify-content-center gap-3">
                <button onClick={() => setVisible(false)} className="btn btn-secondary rounded-pill px-4">
                  Annuler
                </button>
                <button onClick={handleQuit} className="btn btn-danger rounded-pill px-4">
                  Quitter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup résultat */}
        {activePopup === 'result' && result && (
          <div className="blur bg-dark bg-opacity-50 top-0 bottom-0 left-0 right-0 position-absolute z-3 w-100 h-100 d-flex align-items-center justify-content-center">
            <div className="result-card bg-white shadow-lg rounded-4 p-4 text-center">
              <h3 className="fw-bold mb-3">Résultat du Quiz</h3>
              <p className="mb-2">Sous-thème : {result.subTitle}</p>
              <p className="mb-2">Thématique : {result.thematicTitle}</p>
              <p className="fw-bold fs-4 text-success mb-3">
                {result.score} / {result.total}
              </p>
              <p className="mb-2">
                Total de vos points : {totalPoints ?? '...'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary rounded-pill px-4"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
