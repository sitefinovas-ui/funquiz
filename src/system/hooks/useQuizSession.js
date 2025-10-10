import { useCallback, useEffect, useRef, useState } from 'react';
import quizSessionService from '../configurations/Services/quizSessionService.js';

function useQuizSession({ userId, thematicId, subThematicId, totalQuestions, difficultyLevel }) {
  const [sessionId, setSessionId] = useState(null);
  const [resumedState, setResumedState] = useState(null);
  const latestProgressRef = useRef(null);

  const resumeLast = useCallback(async () => {
    if (!userId) return null;
    const sessions = await quizSessionService.getUserSessions(userId);
    const active = sessions.find(s => Number(s.is_completed) === 0);
    if (!active) return null;

    setSessionId(active.session_id);
    const answered = (() => {
      try { return JSON.parse(active.answered_questions || '[]'); } catch { return []; }
    })();
    const sessionData = (() => {
      try { return JSON.parse(active.session_data || '{}'); } catch { return {}; }
    })();

    const state = {
      session_id: active.session_id,
      current_question_index: Number(active.current_question_index || 0),
      answered_questions: answered,
      current_score: Number(active.current_score || 0),
      correct_answers_count: Number(active.correct_answers_count || 0),
      session_data: sessionData,
    };
    setResumedState(state);
    return state;
  }, [userId]);

  const startNew = useCallback(async () => {
    const res = await quizSessionService.createSession({
      user_id: userId,
      thematic_id: thematicId,
      sub_thematic_id: subThematicId || null,
      total_questions: totalQuestions,
      difficulty_level: difficultyLevel || null,
      session_data: { started_at: Date.now() },
    });
    const sid = res?.sessionId;
    setSessionId(sid);
    return sid;
  }, [userId, thematicId, subThematicId, totalQuestions, difficultyLevel]);

  const saveProgress = useCallback(async (progress) => {
    if (!sessionId) return;
    latestProgressRef.current = progress;
    await quizSessionService.updateSession(sessionId, {
      current_question_index: progress.current_question_index,
      answered_questions: progress.answered_questions || [],
      current_score: progress.current_score || 0,
      correct_answers_count: progress.correct_answers_count || 0,
      is_completed: progress.is_completed ? 1 : 0,
    });
  }, [sessionId]);

  const finish = useCallback(async () => {
    if (!sessionId) return;
    await quizSessionService.completeSession(sessionId);
  }, [sessionId]);

  // Sauvegarde auto avant fermeture onglet/navig.
  useEffect(() => {
    const handler = async (e) => {
      if (latestProgressRef.current) {
        try { await saveProgress(latestProgressRef.current); 

        } catch (err) {
            console.log('❌ Erreur lors de la sauvegarde de la session:', err);
        }
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveProgress]);

  return {
    sessionId,
    resumedState,
    resumeLast,
    startNew,
    saveProgress,
    finish,
  };
}

export default useQuizSession;