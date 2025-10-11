import db from "../config/db.js";

// Difficulty level sanitizer: enforce enum 'facile' | 'moyen' | 'difficile'
const sanitizeDifficultyLevel = (value) => {
  const allowed = new Set(['facile', 'moyen', 'difficile']);
  if (value === undefined || value === null) return 'moyen';
  const v = String(value).toLowerCase().trim();
  return allowed.has(v) ? v : 'moyen';
};

// =============================================================================
// FONCTIONS QUIZ - DONNÉES COMPLÈTES
// =============================================================================

export const getAllQuizData = async () => {
  const sql = `
   SELECT 
    t.thematic_id,
    t.title AS thematic_title,
    t.description AS thematic_description,
    t.icon_url,
    t.color_code,
    t.is_active AS view,
    t.updated_at AS date_of_creation,

    JSON_ARRAYAGG(
        JSON_OBJECT(
            'sub_thematic_id', st.sub_thematic_id,
            'title', st.title,
            'description', st.description,
            'difficulty_level', st.difficulty_level,
            'questions', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'question_id', q.question_id,
                        'media_url', q.media_url,
                        'content', q.content,
                        'explanation', q.explanation,
                        'difficulty_level', q.difficulty_level,
                        'question_type', q.question_type,
                        'points', q.points,
                        'time_limit', q.time_limit,
                        'answers', (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'answer_id', a.answer_id,
                                    'answer_option1', a.answer_option1,
                                    'answer_option2', a.answer_option2,
                                    'answer_option3', a.answer_option3,
                                    'correct_option', a.correct_option,
                                    'media_url', a.media_url,
                                    'points_value', a.points_value
                                )
                            )
                            FROM quiz_answers a
                            WHERE a.question_id = q.question_id
                        )
                    )
                )
                FROM quiz_questions q
                WHERE q.sub_thematic_id = st.sub_thematic_id
            )
        )
    ) AS sub_thematics

FROM quiz_thematics t
LEFT JOIN quiz_sub_thematics st ON st.thematic_id = t.thematic_id
GROUP BY t.thematic_id;
  `;

  const [rows] = await db.query(sql);
  return rows;
};

// =============================================================================
// FONCTIONS VALIDATION & SCORING
// =============================================================================

export const getCorrectOptionByQuestion = async (question_id) => {
  const [rows] = await db.query(
    `SELECT q.sub_thematic_id, a.correct_option, a.points_value
     FROM quiz_answers a
     JOIN quiz_questions q ON a.question_id = q.question_id
     WHERE a.question_id = ? 
     LIMIT 1`,
    [question_id],
  );
  return rows[0] || null;
};

export const saveUserAnswerToHistory = async ({
  user_id,
  sub_thematic_id,
  score,
  max_score,
  correct,
}) => {
  const [result] = await db.query(
    `INSERT INTO quiz_game_history 
     (user_id, sub_thematic_id, score, max_score, total_questions, correct_answers)
     VALUES (?, ?, ?, ?, 1, ?)`,
    [user_id, sub_thematic_id, score, max_score, correct ? 1 : 0],
  );
  return result;
};

// =============================================================================
// FONCTIONS POINTS & STATISTIQUES
// =============================================================================

export const getUserTotalPoints = async (user_id) => {
  const [rows] = await db.query(
    `SELECT 
        u.user_id,
        CONCAT(u.first_name, ' ', u.name) AS full_name,
        COALESCE(SUM(gh.score), 0) AS total_points,
        COUNT(DISTINCT gh.history_id) AS total_games_played
     FROM funquiz_users u
     LEFT JOIN quiz_game_history gh ON u.user_id = gh.user_id
     WHERE u.user_id = ?
     GROUP BY u.user_id`,
    [user_id],
  );

  const base = (
    rows[0] || {
      user_id,
      full_name: "",
      total_points: 0,
      total_games_played: 0,
    }
  );

  const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750];
  const total = Number(base.total_points) || 0;

  const computeLevel = (t) => {
    let lvl = 1;
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      if (t >= LEVEL_THRESHOLDS[i]) lvl = i + 1;
      else break;
    }
    return lvl;
  };

  const level = computeLevel(total);
  const prevThreshold = LEVEL_THRESHOLDS[Math.max(0, level - 1)];
  const nextThreshold = LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)];
  const next_level_xp = Math.max(0, nextThreshold - total);
  const xp_in_level = Math.max(0, total - prevThreshold);
  const level_span = Math.max(1, nextThreshold - prevThreshold);

  // Helpers robustes pour manipuler les dates en UTC (format YYYY-MM-DD)
  const toYMD = (input) => {
    if (!input) return null;
    let d;
    if (input instanceof Date) {
      d = new Date(Date.UTC(
        input.getUTCFullYear(),
        input.getUTCMonth(),
        input.getUTCDate()
      ));
    } else if (typeof input === 'string') {
      const m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) {
        d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
      } else {
        // Fallback parse: peut être 'YYYY-MM-DDTHH:MM:SSZ' ou autre ISO
        const tmp = new Date(input);
        if (isNaN(tmp.getTime())) return null;
        d = new Date(Date.UTC(
          tmp.getUTCFullYear(),
          tmp.getUTCMonth(),
          tmp.getUTCDate()
        ));
      }
    } else {
      return null;
    }
    if (isNaN(d.getTime())) return null;
    const y = d.getUTCFullYear();
    const m2 = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m2}-${dd}`;
  };

  const minusOneDay = (input) => {
    const ymd = toYMD(input);
    if (!ymd) return null;
    const [yStr, mStr, dStr] = ymd.split('-');
    const d = new Date(Date.UTC(+yStr, +mStr - 1, +dStr));
    d.setUTCDate(d.getUTCDate() - 1);
    const y = d.getUTCFullYear();
    const m2 = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m2}-${dd}`;
  };

  const [daysRows] = await db.query(
    `
    SELECT DATE(played_at) AS day
    FROM quiz_game_history
    WHERE user_id = ?
    GROUP BY day
    ORDER BY day DESC
    `,
    [user_id]
  );

  // Normalise toutes les valeurs jour et filtre les invalides
  const dayStrings = daysRows
    .map((r) => toYMD(r.day))
    .filter(Boolean);

  const daySet = new Set(dayStrings);

  // Série courante: consécutive terminant au dernier jour d'activité
  let current_streak = 0;
  if (dayStrings.length > 0) {
    let cursor = dayStrings[0]; // dernier jour d'activité (max)
    while (cursor && daySet.has(cursor)) {
      current_streak += 1;
      cursor = minusOneDay(cursor);
    }
  }

  // Meilleure série historique (optionnel)
  let best_streak = 0;
  for (let i = 0; i < dayStrings.length; i++) {
    let count = 1;
    let cur = dayStrings[i];
    let prev = minusOneDay(cur);
    while (prev && daySet.has(prev)) {
      count += 1;
      cur = prev;
      prev = minusOneDay(cur);
    }
    if (count > best_streak) best_streak = count;
  }

  // ➜ Correction : utiliser la colonne existante 'correct_answers'
  const [correctRows] = await db.query(
    `SELECT COALESCE(SUM(correct_answers), 0) AS total_correct_answers
     FROM quiz_game_history
     WHERE user_id = ?`,
    [user_id]
  );
  const total_correct_answers = Number(correctRows?.[0]?.total_correct_answers) || 0;

  return {
    ...base,
    level,
    next_level_xp,
    xp_in_level,
    level_span,
    current_streak,
    best_streak,
    total_correct_answers,
  };
};

export const getAllUsersTotalPoints = async () => {
  const [rows] = await db.query(`
    SELECT 
      up.user_id,
      fu.avatar_url,
      up.name,
      up.first_name,
      up.full_name,
      up.email,
      up.total_points_games,
      up.total_points_achievements,
      up.total_points,
      up.total_games_played,
      up.total_achievements,
      up.average_completion
    FROM user_points up
    JOIN funquiz_users fu ON fu.user_id = up.user_id
    ORDER BY up.total_points DESC, up.total_points_games DESC, up.name ASC  
  `);

  return rows;
};

// =============================================================================
// FONCTIONS CRUD QUESTIONS & RÉPONSES
// =============================================================================

export const createQuestionWithAnswers = async ({
  sub_thematic_id,
  content,
  explanation,
  difficulty_level = 'moyen',
  question_type = 'multiple_choice',
  points = 10,
  time_limit = 30,
  allow_multiple_correct = 0,
  is_active = 1,
  media_url = null,

  // answers payload
  answer_option1,
  answer_option2,
  answer_option3,
  correct_option,
  answer_type = 'text',
  answer_media_url = null,
  points_value = 1,
}) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [qres] = await conn.query(
      `INSERT INTO quiz_questions 
       (sub_thematic_id, content, explanation, difficulty_level, question_type, points, time_limit, allow_multiple_correct, is_active, media_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sub_thematic_id,
        content,
        explanation || null,
        sanitizeDifficultyLevel(difficulty_level),
        question_type,
        points,
        time_limit,
        allow_multiple_correct ? 1 : 0,
        is_active ? 1 : 0,
        media_url || null,
      ],
    );
    const question_id = qres.insertId;

    await conn.query(
      `INSERT INTO quiz_answers
       (question_id, answer_option1, answer_option2, answer_option3, correct_option, answer_type, media_url, points_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        question_id,
        answer_option1,
        answer_option2,
        answer_option3,
        Number(correct_option),
        answer_type,
        answer_media_url || null,
        points_value,
      ],
    );

    await conn.commit();
    return { question_id };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const updateQuestionById = async (
  question_id,
  {
    content,
    explanation,
    difficulty_level,
    question_type,
    points,
    time_limit,
    allow_multiple_correct,
    is_active,
    media_url,
  },
) => {
  const [res] = await db.query(
    `UPDATE quiz_questions
     SET content = ?, explanation = ?, difficulty_level = ?, question_type = ?, points = ?, time_limit = ?, allow_multiple_correct = ?, is_active = ?, media_url = ?
     WHERE question_id = ?`,
    [
      content,
      explanation ?? null,
      sanitizeDifficultyLevel(difficulty_level),
      question_type,
      points,
      time_limit,
      allow_multiple_correct ? 1 : 0,
      is_active ? 1 : 0,
      media_url ?? null,
      question_id,
    ],
  );
  return res;
};

export const updateAnswersForQuestion = async (
  question_id,
  {
    answer_option1,
    answer_option2,
    answer_option3,
    correct_option,
    answer_type,
    media_url,
    points_value,
  },
) => {
    const [res] = await db.query(
      `UPDATE quiz_answers
       SET answer_option1 = ?, answer_option2 = ?, answer_option3 = ?, correct_option = ?, answer_type = ?, media_url = ?, points_value = ?
       WHERE question_id = ?`,
      [
        answer_option1,
        answer_option2,
        answer_option3,
        Number(correct_option),
        answer_type,
        media_url ?? null,
        points_value,
        question_id,
      ],
    );
    return res;
};

export const deleteQuestionById = async (question_id) => {
  const [res] = await db.query(
    `DELETE FROM quiz_questions WHERE question_id = ?`,
    [question_id],
  );
  return res;
};

// =============================================================================
// MODÈLE QUIZ PRINCIPAL
// =============================================================================

const quizModel = {
  // Sous-thématiques
  getSubThematicsByThematic: async (thematic_id) => {
    const [rows] = await db.query(
      `
      SELECT * 
      FROM quiz_sub_thematics 
      WHERE thematic_id = ? AND is_active = TRUE
      ORDER BY display_order
    `,
      [thematic_id],
    );
    return rows;
  },

  // ➕ Liste complète des sous-thématiques (sans filtre)
  getAllSubThematics: async () => {
    const [rows] = await db.query(
      `SELECT * FROM quiz_sub_thematics ORDER BY display_order, sub_thematic_id`
    );
    return rows;
  },

  // 🔍 Récupérer une sous-thématique par ID
  getSubThematicById: async (id) => {
    const [rows] = await db.query(
      `SELECT * FROM quiz_sub_thematics WHERE sub_thematic_id = ?`,
      [id],
    );
    return rows.length ? rows[0] : null;
  },

  // ➕ Créer une sous-thématique
  createSubThematic: async ({
    thematic_id,
    title,
    description,
    difficulty_level = 'moyen',
    display_order = 0,
    is_active = 1,
  }) => {
    const [res] = await db.query(
      `INSERT INTO quiz_sub_thematics
       (thematic_id, title, description, difficulty_level, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Number(thematic_id),
        title,
        description ?? null,
        sanitizeDifficultyLevel(difficulty_level),
        is_active ? 1 : 0,
        Number(display_order) || 0,
      ],
    );
    return res.insertId;
  },

  // ✏️ Mettre à jour une sous-thématique
  updateSubThematic: async (
    id,
    { thematic_id, title, description, difficulty_level, display_order, is_active }
  ) => {
    const [res] = await db.query(
      `UPDATE quiz_sub_thematics
       SET thematic_id = ?, title = ?, description = ?, difficulty_level = ?, display_order = ?, is_active = ?
       WHERE sub_thematic_id = ?`,
      [
        Number(thematic_id),
        title,
        description ?? null,
        sanitizeDifficultyLevel(difficulty_level),
        Number(display_order) || 0,
        is_active ? 1 : 0,
        Number(id),
      ],
    );
    return res;
  },

  // 🗑️ Supprimer une sous-thématique
  deleteSubThematic: async (id) => {
    const [res] = await db.query(
      `DELETE FROM quiz_sub_thematics WHERE sub_thematic_id = ?`,
      [Number(id)],
    );
    return res;
  },

  // Questions
  getQuestionsBySubThematic: async (sub_thematic_id) => {
    const [rows] = await db.query(
      `
      SELECT q.question_id, q.content, q.question_type, q.points, q.time_limit
      FROM quiz_questions q
      WHERE q.sub_thematic_id = ? AND q.is_active = TRUE
      ORDER BY q.question_id
    `,
      [sub_thematic_id],
    );
    return rows;
  },

  // Réponses
  getAnswersByQuestion: async (question_id) => {
    const [rows] = await db.query(
      `
      SELECT answer_id, answer_option1, answer_option2, answer_option3, answer_type, media_url, correct_option
      FROM quiz_answers
      WHERE question_id = ?
      ORDER BY points_value
    `,
      [question_id],
    );
    return rows;
  },

  // Thématiques - CRUD
  getAllThematics: async () => {
    const [rows] = await db.query(
      "SELECT * FROM quiz_thematics ORDER BY display_order",
    );
    return rows;
  },

  getThematicById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM quiz_thematics WHERE thematic_id = ?",
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  createThematic: async ({
    title,
    description,
    icon_url,
    color_code,
    display_order,
  }) => {
    const [result] = await db.query(
      `
      INSERT INTO quiz_thematics (title, description, icon_url, color_code, display_order)
      VALUES (?, ?, ?, ?, ?)
    `,
      [title, description, icon_url, color_code, display_order],
    );
    return result.insertId;
  },

  updateThematic: async (
    id,
    { title, description, icon_url, color_code, display_order, is_active },
  ) => {
    const sql = `
      UPDATE quiz_thematics
      SET title = ?, description = ?, color_code = ?, display_order = ?, is_active = ?
      ${icon_url ? ", icon_url = ?" : ""}
      WHERE thematic_id = ?
    `;
    const params = icon_url
      ? [title, description, color_code, display_order, is_active, icon_url, id]
      : [title, description, color_code, display_order, is_active, id];

    const [result] = await db.query(sql, params);
    return result;
  },

  deleteThematic: async (id) => {
    const [result] = await db.query(
      "DELETE FROM quiz_thematics WHERE thematic_id = ?",
      [id],
    );
    return result;
  },
};

export default quizModel;
