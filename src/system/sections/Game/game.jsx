import './game.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Loading from '../../components/Loading/loading.jsx';
import Logo from '../../../assets/Log.png';
import btnclose from '../../../assets/icons/btn-close.svg';
import quizSessionService from '../../configurations/Services/quizSessionService.js';
import authService from '../../configurations/Services/authServices.js';
import thematicService from '../../configurations/Services/thematicServices.js';
import subThematicServices from '../../configurations/Services/subThematicServices.js';
import quizAnswerService from '../../configurations/Services/quizAnswerService.js';
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

  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const sessionIdRef = useRef(null);
  const [answered, setAnswered] = useState([]);
  const [orderedQuestions, setOrderedQuestions] = useState([]);

  // Mélange d'ordre des questions ET des réponses
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Mélange les réponses d'une question et retourne la nouvelle position de la bonne réponse
  const shuffleAnswers = (question) => {
    if (!question?.answers?.[0]) return question;

    const answersObj = question.answers[0];
    const correctOption = Number(answersObj.correct_option);
    
    // Extraire les réponses
    const answerKeys = Object.keys(answersObj).filter(key => key.startsWith('answer_option'));
    const answers = answerKeys.map((key, index) => ({
      text: answersObj[key],
      originalIndex: index + 1, // Position originale (1-based)
      isCorrect: (index + 1) === correctOption
    }));

    // Mélanger les réponses
    const shuffledAnswers = shuffle(answers);

    // Trouver la nouvelle position de la bonne réponse
    const newCorrectIndex = shuffledAnswers.findIndex(a => a.isCorrect) + 1;
    const answerOrder = shuffledAnswers.map((a) => a.originalIndex);

    // Reconstruire l'objet réponse
    const newAnswersObj = { correct_option: newCorrectIndex };
    shuffledAnswers.forEach((answer, index) => {
      newAnswersObj[`answer_option_${index + 1}`] = answer.text;
    });

    return {
      ...question,
      answers: [newAnswersObj],
      answer_order: answerOrder,
      _originalCorrectOption: correctOption // Pour debug si besoin
    };
  };

  const normalize = (s) =>
    s ? s.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

  const computeCorrectCount = (list) =>
    list.reduce((acc, a) => {
      const q = questions.find((x) => x.question_id === a.questionId) || {};
      const correct = Number(q?.answers?.[0]?.correct_option);
      const selected = Number(a.selectedOption);
      return acc + (selected === correct ? 1 : 0);
    }, 0);

  // ✨ FONCTION CENTRALISÉE DE SAUVEGARDE
  const saveProgress = async (answeredList, scoreValue, questionIndex, completed = false) => {
    const sid = sessionIdRef.current || sessionId;
    if (!sid) {
      console.warn('⚠️ Aucun sessionId disponible pour la sauvegarde');
      return false;
    }

    try {
      await quizSessionService.updateSession(sid, {
        current_question_index: questionIndex,
        answered_questions: answeredList,
        current_score: scoreValue,
        correct_answers_count: computeCorrectCount(answeredList),
        is_completed: completed ? 1 : 0,
      });

      console.log(`💾 Progression sauvegardée:`, {
        réponses: answeredList.length,
        score: scoreValue,
        index: questionIndex,
        terminé: completed
      });
      return true;
    } catch (e) {
      console.error('❌ Erreur sauvegarde:', e?.message);
      return false;
    }
  };

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

  useEffect(() => {
    document.title = 'FUNQUIZ | Session de jeu';
    (async () => {
      try {
        const me = await authService.getCurrentUser();
        const uid = me?.user_id ?? me?.id;
        setUserId(uid);
        if (!uid) return;

        const { tId, stId } = await resolveIdsByTitles();

        if (!tId) {
          console.warn("ID thématique introuvable pour", thematicTitle);
          return;
        }

        const sessions = await quizSessionService.getUserSessions(uid);
        const target =
          sessions.find((s) => {
            if (Number(s.is_completed) === 1) return false;
            const sameT = Number(s.thematic_id) === Number(tId);
            const sameST = stId ? Number(s.sub_thematic_id) === Number(stId) : true;
            return sameT && sameST;
          }) || sessions.find((s) => Number(s.is_completed) === 0);

        if (target) {
          let orderIds = null;
          try {
            const sd =
              typeof target.session_data === 'string'
                ? JSON.parse(target.session_data || '{}')
                : target.session_data || {};
            if (Array.isArray(sd?.question_order)) orderIds = sd.question_order;
          } catch {}

          if (orderIds && orderIds.length) {
            const reordered = orderIds
              .map((id) => (questions || []).find((q) => q.question_id === id))
              .filter(Boolean);
            
            // Récupérer les réponses mélangées de la session
            const savedShuffled = (() => {
              try {
                const sd = typeof target.session_data === 'string'
                  ? JSON.parse(target.session_data || '{}')
                  : target.session_data || {};
                return sd?.shuffled_questions || null;
              } catch { return null; }
            })();

            if (savedShuffled && savedShuffled.length) {
              // Utiliser les questions déjà mélangées de la session
              setOrderedQuestions(savedShuffled);
            } else {
              // Mélanger les réponses pour la première fois
              const withShuffledAnswers = reordered.map(q => shuffleAnswers(q));
              setOrderedQuestions(withShuffledAnswers);
            }
          } else {
            const withShuffledAnswers = questions.map(q => shuffleAnswers(q));
            setOrderedQuestions(withShuffledAnswers);
          }

          setSessionId(target.session_id);
          sessionIdRef.current = target.session_id;
          const answeredPrev = (() => {
            try { return JSON.parse(target.answered_questions || '[]'); } catch { return []; }
          })();
          setAnswered(answeredPrev);
          const idxRaw = Number(target.current_question_index || 0);
          const safeIndex = Math.min(Math.max(idxRaw, 0), Math.max((questions || []).length - 1, 0));
          setCurrentIndex(safeIndex);
          setScore(Number(target.current_score || 0));
        } else {
          // Nouvelle session : mélanger questions ET réponses
          const shuffled = shuffle(questions || []);
          const withShuffledAnswers = shuffled.map(q => shuffleAnswers(q));
          setOrderedQuestions(withShuffledAnswers);
          
          const orderIds = shuffled.map((q) => q.question_id);
          const res = await quizSessionService.createSession({
            user_id: uid,
            thematic_id: tId,
            sub_thematic_id: stId || null,
            total_questions: (questions || []).length,
            difficulty_level: null,
            session_data: { 
              thematicTitle, 
              subTitle, 
              question_order: orderIds,
              shuffled_questions: withShuffledAnswers // Sauvegarder l'ordre mélangé
            },
          });
          const newSessionId = res?.sessionId || null;
          setSessionId(newSessionId);
          sessionIdRef.current = newSessionId;
        }
      } catch (e) {
        console.warn('Session non initialisée:', e?.message);
      }
    })();
  }, []);

  if (!questions || questions.length === 0) {
    return (
      <div className="vh-100 vw-100 d-flex flex-column align-items-center justify-content-center">
        <h2>Aucune question disponible pour cette sous-thématique.</h2>
        <button onClick={() => navigate(-1)} className="btn btn-primary mt-3">
          Retour
        </button>
      </div>
    );
  }

  const currentQuestion = orderedQuestions[currentIndex] || questions[currentIndex];
  const totalQuestions = orderedQuestions.length || questions.length;

  // 🎯 GESTION DE LA RÉPONSE
  const handleSelectAnswer = async (index) => {
    if (isValidated) return;

    setSelectedAnswer(index);
    setIsValidated(true);

    const correctOptionRaw = currentQuestion.answers[0]?.correct_option;
    const correctOption = Number(correctOptionRaw);
    const isCorrect = (index + 1) === correctOption;

    const selectedOriginalOption = Array.isArray(currentQuestion?.answer_order)
      ? Number(currentQuestion.answer_order[index])
      : index + 1;
    const scoreNext = score + (isCorrect ? 1 : 0);
    setScore(scoreNext);
    const answeredNext = [
      ...answered,
      { questionId: currentQuestion.question_id, selectedOption: selectedOriginalOption }
    ];
    setAnswered(answeredNext);

    const isLastQuestion = currentIndex + 1 >= totalQuestions;
    const nextIndex = currentIndex + 1;

    console.log('📝 Réponse enregistrée:', {
      question: currentIndex + 1,
      dernière: isLastQuestion,
      score: scoreNext,
      optionSélectionnée: index + 1,
      optionOriginale: selectedOriginalOption,
      bonneRéponse: correctOption
    });

    // 💾 Sauvegarde immédiate après chaque réponse
    await saveProgress(answeredNext, scoreNext, nextIndex, isLastQuestion);

    if (!isLastQuestion) {
      // ⏭️ Question suivante
      setTimeout(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
        setSelectedAnswer(null);
        setIsValidated(false);
      }, 500);
    } else {
      // 🏁 Dernière question : finalisation
      const sid = sessionIdRef.current || sessionId;

      try {
        if (sid) {
          await quizSessionService.completeSession(sid);
        } else {
          console.warn('⚠️ SessionId manquant : fin de session non enregistrée');
        }
      } catch (e) {
        console.error('❌ Erreur finalisation session:', e?.message);
      }

      try {
        const result = await quizAnswerService.pushFinalPoints({
          userId,
          answered: answeredNext,
        });
        if (result?.sent > 0) {
          window.dispatchEvent(new CustomEvent('points:updated'));
        }
        console.log('✅ Points enregistrés:', result);
      } catch (e) {
        console.error('❌ Erreur enregistrement points:', e?.message);
      }

      // Afficher les résultats
      openPopup('result', {
        sessionId,
        score: computeCorrectCount(answeredNext),
        total: totalQuestions,
        thematicTitle,
        subTitle,
        userId,
        playedAt: new Date().toISOString(),
      });
    }
  };

  // 🚪 QUITTER LE QUIZ
  const handleQuit = async () => {
    console.log('🚪 Tentative de quitter le quiz');
    
    try {
      // Sauvegarde avant de quitter (non terminé)
      await saveProgress(answered, score, currentIndex, false);
      console.log('✅ Progression sauvegardée avant de quitter');
    } catch (e) {
      console.error('❌ Sauvegarde avant quit échouée:', e?.message);
    } finally {
      navigate('/');
    }
  };

  const getCardClass = (index) => (selectedAnswer === index ? 'selected border-primary bg-custom-quiz' : 'border-secondary');

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
                {Math.min(currentIndex + 1, totalQuestions)}/{totalQuestions}
              </span>
            </h2>
            <h4 className="mt-3 text-dark">{currentQuestion?.content ?? ''}</h4>
          </div>
        </div>

        {/* Partie droite */}
        <div style={{ width: '320px', maxHeight: '600px' }} className="visio-two bg-white shadow-lg rounded-4 p-4 position-relative">
          {currentQuestion?.answers && currentQuestion.answers.length > 0 ? (
            <div>
              {Object.keys(currentQuestion.answers?.[0] ?? {})
                .filter((key) => key.startsWith('answer_option'))
                .map((key, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectAnswer(i)}
                    disabled={isValidated}
                    className={`quiz-btn d-flex gap-2 align-items-center mb-2 ${getCardClass(i)}`}
                  >
                    <span className="fw-bold text-uppercase letter">{String.fromCharCode(65 + i)}</span>
                    <span>{(currentQuestion.answers?.[0] ?? {})[key]}</span>
                  </button>
                ))}
            </div>
          ) : (
            <div className="d-flex justify-content-end mt-4">
              <button 
                onClick={() => {
                  setCurrentIndex(prev => prev + 1);
                  setSelectedAnswer(null);
                  setIsValidated(false);
                }} 
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
                <button onClick={() => setVisible(false)} className="btn btn-secondary rounded-pill px-4">Annuler</button>
                <button onClick={handleQuit} className="btn btn-danger rounded-pill px-4">Quitter</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuizComponent;
