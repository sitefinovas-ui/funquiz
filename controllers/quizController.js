import {
  getAllQuizData,
  getCorrectOptionByQuestion,
  saveUserAnswerToHistory,
  getUserTotalPoints,
  getAllUsersTotalPoints,
  createQuestionWithAnswers,
  updateQuestionById,
  updateAnswersForQuestion,
  deleteQuestionById,
  updateQuestionWithAnswers,
} from "../models/quizModel.js";
import quizModel from "../models/quizModel.js";
import { logModeratorAction } from "../models/moderatorActionModel.js";
import xlsx from "xlsx";

// Récupérer tout le quiz
export const allQuizData = async (req, res) => {
  try {
    const data = await getAllQuizData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validateAnswer = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { question_id, selected_option } = req.body;

    const correctData = await getCorrectOptionByQuestion(question_id);
    if (!correctData)
      return res.status(404).json({ error: "Question introuvable" });

    const is_correct = parseInt(selected_option) === correctData.correct_option;
    const points_awarded = is_correct ? correctData.points_value || 1 : 0;

    await saveUserAnswerToHistory({
      user_id,
      sub_thematic_id: correctData.sub_thematic_id,
      score: points_awarded,
      max_score: correctData.points_value || 1,
      correct: is_correct,
    });

    res.json({ question_id, is_correct, points_awarded });
  } catch (error) {
    console.error("Erreur validateAnswer:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserPoints = async (req, res) => {
  try {
    const { user_id } = req.params;
    const data = await getUserTotalPoints(user_id);
    // On renvoie tel quel, déjà typé côté modèle
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsersPoints = async (req, res) => {
  try {
    const users = await getAllUsersTotalPoints();

    const formattedUsers = users.map((user) => ({
      ...user,
      total_points: Number(user.total_points) || 0,
      total_points_games: Number(user.total_points_games) || 0,
      total_points_achievements: Number(user.total_points_achievements) || 0,
      total_games_played: Number(user.total_games_played) || 0,
      total_achievements: Number(user.total_achievements) || 0,
      average_completion: user.average_completion
        ? Number(user.average_completion).toFixed(2)
        : "0.00",
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error) {
    console.error("❌ Erreur dans getAllUsersPoints:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message,
    });
  }
};

export const getSubThematics = async (req, res) => {
  try {
    const { thematic_id } = req.params;
    const subThematics = await quizModel.getSubThematicsByThematic(thematic_id);
    res.json(subThematics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const { sub_thematic_id } = req.params;
    const questions =
      await quizModel.getQuestionsBySubThematic(sub_thematic_id);
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getAnswers = async (req, res) => {
  try {
    const { question_id } = req.params;
    const answers = await quizModel.getAnswersByQuestion(question_id);
    res.json(answers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    console.log("📥 Creating Question - Body:", req.body);
    const allowed = ['facile', 'moyen', 'difficile'];
    const lvl = allowed.includes(req.body.difficulty_level) ? req.body.difficulty_level : 'moyen';

    const normalizeQuestionType = (t) => {
      const v = String(t || '').trim().toLowerCase();
      const map = {
        qcm: 'multiple_choice',
        'choix multiple': 'multiple_choice',
        'choix_unique': 'single_choice',
        'choix unique': 'single_choice',
        'vrai/faux': 'true_false',
        'vrai faux': 'true_false',
        vf: 'true_false',
        'texte libre': 'fill_in_blank',
        texte: 'fill_in_blank',
        multiple_choice: 'multiple_choice',
        single_choice: 'single_choice',
        true_false: 'true_false',
        fill_in_blank: 'fill_in_blank',
      };
      return map[v] || 'multiple_choice';
    };

    const payload = { 
      ...req.body, 
      difficulty_level: lvl,
      question_type: normalizeQuestionType(req.body.question_type),
      media_url: req.file ? `/uploads/thematics/${req.file.filename}` : req.body.media_url,
    };

    const result = await createQuestionWithAnswers(payload);
    res.status(201).json({ message: "Question créée", question_id: result.question_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    console.log("📥 Updating Question - ID:", req.params.question_id, "Body:", req.body);
    const allowed = ['facile', 'moyen', 'difficile'];
    const lvl = allowed.includes(req.body.difficulty_level) ? req.body.difficulty_level : 'moyen';

    const normalizeQuestionType = (t) => {
      const v = String(t || '').trim().toLowerCase();
      const map = {
        qcm: 'multiple_choice',
        'choix multiple': 'multiple_choice',
        'choix_unique': 'single_choice',
        'choix unique': 'single_choice',
        'vrai/faux': 'true_false',
        'vrai faux': 'true_false',
        vf: 'true_false',
        'texte libre': 'fill_in_blank',
        texte: 'fill_in_blank',
        multiple_choice: 'multiple_choice',
        single_choice: 'single_choice',
        true_false: 'true_false',
        fill_in_blank: 'fill_in_blank',
      };
      return map[v] || 'multiple_choice';
    };

    await updateQuestionWithAnswers(req.params.question_id, { 
      ...req.body, 
      difficulty_level: lvl,
      question_type: normalizeQuestionType(req.body.question_type),
      media_url: req.file ? `/uploads/thematics/${req.file.filename}` : req.body.media_url,
    });
    res.json({ message: "Question mise à jour" });
  } catch (error) {
    console.error("❌ updateQuestion Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateQuestionAnswers = async (req, res) => {
  try {
    const normalizeAnswerType = (t) => {
      const v = String(t || '').trim().toLowerCase();
      const map = {
        texte: 'text',
        'texte libre': 'text',
        text: 'text',
        image: 'image',
        audio: 'audio',
        video: 'video',
        'vidéo': 'video',
      };
      return map[v] || 'text';
    };

    const payload = {
      ...req.body,
      answer_type: normalizeAnswerType(req.body.answer_type),
    };

    const qId = req.params.question_id || req.body.question_id;
    if (!qId) return res.status(400).json({ error: "Identifiant de question manquant" });

    await updateAnswersForQuestion(qId, payload);
    res.json({ message: "Réponses mises à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    await deleteQuestionById(req.params.question_id);
    res.json({ message: "Question supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------
// CRUD Sous-thématiques
// -----------------------------
export const getAllSubThematics = async (req, res) => {
  try {
    const { thematic_id } = req.query;
    if (thematic_id) {
      const subs = await quizModel.getSubThematicsByThematic(thematic_id);
      return res.json(subs);
    }
    const subs = await quizModel.getAllSubThematics();
    return res.json(subs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getSubThematicById = async (req, res) => {
  try {
    const sub = await quizModel.getSubThematicById(req.params.id);
    if (!sub) return res.status(404).json({ error: "Sous-thématique introuvable" });
    res.json(sub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createSubThematic = async (req, res) => {
  try {
    const {
      thematic_id,
      title,
      description = null,
      difficulty_level = 'moyen',
      display_order = 0,
      is_active = 1,
    } = req.body;

    if (!thematic_id || !title) {
      return res.status(400).json({ error: "thematic_id et title sont requis" });
    }

    const allowed = ['facile', 'moyen', 'difficile'];
    const lvl = allowed.includes(difficulty_level) ? difficulty_level : 'moyen';

    const insertId = await quizModel.createSubThematic({
      thematic_id,
      title,
      description,
      difficulty_level: lvl,
      display_order,
      is_active,
    });

    res.status(201).json({ message: "Sous-thématique créée", sub_thematic_id: insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateSubThematic = async (req, res) => {
  try {
    const {
      thematic_id,
      title,
      description = null,
      difficulty_level,
      display_order,
      is_active,
    } = req.body;

    const allowed = ['facile', 'moyen', 'difficile'];
    const lvl = allowed.includes(difficulty_level) ? difficulty_level : 'moyen';

    await quizModel.updateSubThematic(req.params.id, {
      thematic_id,
      title,
      description,
      difficulty_level: lvl,
      display_order,
      is_active,
    });

    res.json({ message: "Sous-thématique mise à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubThematic = async (req, res) => {
  try {
    await quizModel.deleteSubThematic(req.params.id);
    res.json({ message: "Sous-thématique supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createThematic = async (req, res) => {
  try {
    const { title, description, color_code, country_code, display_order } = req.body;
    const icon_url = req.file
      ? `/uploads/thematics/${req.file.filename}`
      : null;

    const insertId = await quizModel.createThematic({
      title,
      description,
      icon_url,
      color_code,
      country_code,
      display_order,
    });

    if (req.user) {
      await logModeratorAction({
        moderator_id: req.user.user_id,
        action_type: "create_thematic",
        target_type: "thematic",
        target_id: insertId,
        details: `Titre: ${title}`
      });
    }

    res
      .status(201)
      .json({ message: "Thématique créée", thematic_id: insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateThematic = async (req, res) => {
  try {
    const { title, description, color_code, country_code, display_order, is_active } =
      req.body;
    const icon_url = req.file
      ? `/uploads/thematics/${req.file.filename}`
      : undefined;

    await quizModel.updateThematic(req.params.id, {
      title,
      description,
      color_code,
      country_code,
      display_order,
      is_active,
      icon_url,
    });

    if (req.user) {
      await logModeratorAction({
        moderator_id: req.user.user_id,
        action_type: "update_thematic",
        target_type: "thematic",
        target_id: req.params.id,
        details: `Titre: ${title}`
      });
    }

    res.json({ message: "Thématique mise à jour" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteThematic = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }
    await quizModel.deleteThematic(id);

    if (req.user) {
      await logModeratorAction({
        moderator_id: req.user.user_id,
        action_type: "delete_thematic",
        target_type: "thematic",
        target_id: id,
        details: "Suppression de la thématique"
      });
    }

    res.json({ message: "Thématique supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const purgeThematics = async (req, res) => {
  try {
    const result = await quizModel.purgeAllThematics();
    res.json({ message: "Toutes les thématiques supprimées", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllThematics = async (req, res) => {
  try {
    const thematics = await quizModel.getAllThematics();
    res.json(thematics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getThematicById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }
    const thematic = await quizModel.getThematicById(id);
    if (!thematic)
      return res.status(404).json({ error: "Thématique introuvable" });
    res.json(thematic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const importThematics = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Aucun fichier envoyé" });

    const { mimetype, buffer } = req.file;
    let rows = [];

    const splitLine = (line, sep) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === sep && !inQuotes) {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current);
      return result.map((c) => c.replace(/^"(.*)"$/, "$1"));
    };

    if (
      mimetype === "text/csv" ||
      mimetype === "application/vnd.ms-excel" ||
      mimetype === "text/plain" ||
      mimetype === "application/octet-stream" ||
      mimetype === "text/tab-separated-values"
    ) {
      let content = buffer.toString("utf-8").replace(/^\uFEFF/, "");
      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (!lines.length) return res.status(400).json({ error: "Fichier vide" });

      const sep = lines[0].includes(";")
        ? ";"
        : lines[0].includes("\t")
          ? "\t"
          : ",";
      rows = lines.map((l) => splitLine(l, sep));
    } else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const wb = xlsx.read(buffer, { type: "buffer" });
      const sheetName = wb.SheetNames[0];
      rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
    } else {
      return res.status(400).json({ error: "Type de fichier non supporté" });
    }

    if (!rows.length) return res.status(400).json({ error: "Fichier vide" });

    const [headers, ...data] = rows;
    console.log("📥 Raw Headers:", headers);
    const normalizedHeaders = headers.map((h) =>
      String(h || "")
        .replace(/\uFEFF/g, "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_') // Remplacer les espaces et tirets par des underscores
    );
    console.log("📥 Normalized Headers:", normalizedHeaders);

    const headerMap = {
      thematic_title: ["thematic_title", "titre_thematique", "titre_thématique", "thématique", "thematique", "titre_thème", "thème"],
      thematic_description: ["thematic_description", "description_thematique", "description_thématique", "description"],
      color_code: ["color_code", "code_couleur", "couleur", "code_hexa", "hexa"],
      country_code: ["country_code", "code_pays", "pays", "pays_code"],
      sub_thematic_title: ["sub_thematic_title", "titre_sous_thematique", "titre_sous_thématique", "sous_thématique", "sous_thematique", "quiz_titre"],
      sub_thematic_description: ["sub_thematic_description", "description_sous_thematique", "description_sous_thématique", "sous_description"],
      difficulty_level: ["difficulty_level", "niveau_difficulte", "difficulté", "difficulte", "niveau"]
    };

    const idx = {};
    for (const key of Object.keys(headerMap)) {
      const found = normalizedHeaders.findIndex((h) =>
        headerMap[key].includes(h),
      );
      idx[key] = found;
    }

    if (idx.thematic_title === -1) {
      return res.status(400).json({
        error: "En-tête 'thematic_title' manquant.",
        details: { normalizedHeaders },
      });
    }

    let createdCount = 0;
    let subCreatedCount = 0;
    const thematicCache = new Map();
    const defaultCountry = req.body.default_country_code || "CI";

    for (const row of data) {
      const tTitle = row[idx.thematic_title]?.toString().trim();
      if (!tTitle) continue;

      let tId;
      if (thematicCache.has(tTitle.toLowerCase())) {
        tId = thematicCache.get(tTitle.toLowerCase());
      } else {
        const existingThematics = await quizModel.getAllThematics();
        const existing = existingThematics.find(t => t.title.toLowerCase() === tTitle.toLowerCase());
        
        if (existing) {
          tId = existing.thematic_id;
        } else {
          tId = await quizModel.createThematic({
            title: tTitle,
            description: idx.thematic_description !== -1 ? row[idx.thematic_description]?.toString().trim() : "",
            color_code: idx.color_code !== -1 ? row[idx.color_code]?.toString().trim() : "#6366f1",
            country_code: idx.country_code !== -1 ? (row[idx.country_code]?.toString().trim() || defaultCountry) : defaultCountry,
            display_order: 0
          });
          createdCount++;
        }
        thematicCache.set(tTitle.toLowerCase(), tId);
      }

      const stTitle = idx.sub_thematic_title !== -1 ? row[idx.sub_thematic_title]?.toString().trim() : null;
      if (stTitle) {
        await quizModel.createSubThematic({
          thematic_id: tId,
          title: stTitle,
          description: idx.sub_thematic_description !== -1 ? row[idx.sub_thematic_description]?.toString().trim() : "",
          difficulty_level: idx.difficulty_level !== -1 ? row[idx.difficulty_level]?.toString().trim() : "moyen",
          display_order: 0,
          is_active: 1
        });
        subCreatedCount++;
      }
    }

    if (req.user) {
      await logModeratorAction({
        moderator_id: req.user.user_id,
        action_type: "import_thematics",
        target_type: "thematic",
        target_id: null,
        details: `Importation de ${createdCount} thématiques et ${subCreatedCount} sous-thématiques`
      });
    }

    res.status(200).json({
      message: "Importation réussie",
      details: {
        thematics_created: createdCount,
        sub_thematics_created: subCreatedCount
      }
    });
  } catch (error) {
    console.error("❌ importThematics:", error);
    res.status(500).json({ error: error.message });
  }
};

export const importQuestions = async (req, res) => {
  try {
    console.log("📥 Body fields:", req.body);
    if (!req.file)
      return res.status(400).json({ error: "Aucun fichier envoyé" });

    const { mimetype, buffer } = req.file;
    let rows = [];

    const splitLine = (line, sep) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === sep && !inQuotes) {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current);
      return result.map((c) => c.replace(/^"(.*)"$/, "$1"));
    };

    if (
      mimetype === "text/csv" ||
      mimetype === "application/vnd.ms-excel" ||
      mimetype === "text/plain" ||
      mimetype === "application/octet-stream" ||
      mimetype === "text/tab-separated-values"
    ) {
      let content = buffer.toString("utf-8").replace(/^\uFEFF/, "");
      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (!lines.length) return res.status(400).json({ error: "Fichier vide" });

      const sep = lines[0].includes(";")
        ? ";"
        : lines[0].includes("\t")
          ? "\t"
          : ",";
      rows = lines.map((l) => splitLine(l, sep));
    } else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const wb = xlsx.read(buffer, { type: "buffer" });
      const sheetName = wb.SheetNames[0];
      rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
    } else {
      return res.status(400).json({ error: "Type de fichier non supporté" });
    }

    if (!rows.length) return res.status(400).json({ error: "Fichier vide" });

    const [headers, ...data] = rows;
    const normalizedHeaders = headers.map((h) =>
      String(h || "")
        .replace(/\uFEFF/g, "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_') // Remplacer les espaces et tirets par des underscores
    );

    const headerMap = {
      sub_thematic_id: ["sub_thematic_id", "id_sous_thematique", "id_sous_thématique", "id_sous_thème", "id_sous_theme"],
      sub_thematic_title: ["sub_thematic_title", "titre_sous_thematique", "titre_sous_thématique", "sous_thématique", "sous_thematique", "quiz_titre", "quiz", "nom_du_quiz"],
      question_content: ["question_content", "contenu_question", "question", "énoncé", "enonce"],
      explanation: ["explanation", "explication", "justification"],
      difficulty: ["difficulty", "difficulté", "difficulte", "niveau"],
      points: ["points", "score"],
      time_limit: ["time_limit", "temps", "limite_temps"],
      option1: ["option1", "réponse1", "reponse1", "choix1", "réponse_1", "reponse_1"],
      option2: ["option2", "réponse2", "reponse2", "choix2", "réponse_2", "reponse_2"],
      option3: ["option3", "réponse3", "reponse3", "choix3", "réponse_3", "reponse_3"],
      correct_option: ["correct_option", "bonne_reponse", "bonne_réponse", "correct", "bonne_réponse_(1-3)", "bonne_reponse_(1-3)"],
      media_url: ["media_url", "image_url", "image", "media"]
    };

    const idx = {};
    for (const key of Object.keys(headerMap)) {
      const found = normalizedHeaders.findIndex((h) =>
        headerMap[key].includes(h),
      );
      idx[key] = found;
    }

    if (idx.question_content === -1 || idx.option1 === -1 || idx.correct_option === -1) {
      return res.status(400).json({
        error: "En-têtes obligatoires manquants (Question, Option1, Bonne Réponse).",
        details: { normalizedHeaders },
      });
    }

    let createdCount = 0;
    let skippedCount = 0;
    const defaultSubThematicId = (req.body.sub_thematic_id && !isNaN(Number(req.body.sub_thematic_id))) 
      ? Number(req.body.sub_thematic_id) 
      : null;
    const allSubs = await quizModel.getAllSubThematics();
    
    // Fonction pour nettoyer le texte (virer accents, minuscules, espaces)
    const slugify = (str) => 
      String(str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") // On garde que les lettres et chiffres pour comparer
        .trim();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const content = row[idx.question_content]?.toString().trim();
      
      if (!content) {
        skippedCount++;
        continue;
      }

      let subId = defaultSubThematicId;
      const stTitle = idx.sub_thematic_title !== -1 ? row[idx.sub_thematic_title]?.toString().trim() : null;
      
      if (stTitle && stTitle.length > 0) {
        const searchTitle = slugify(stTitle);
        
        // Recherche intelligente : exacte, puis contient, puis floue
        let found = allSubs.find(s => slugify(s.title) === searchTitle);
        if (!found) found = allSubs.find(s => slugify(s.thematic_title + " " + s.title) === searchTitle);
        if (!found) found = allSubs.find(s => slugify(s.title).includes(searchTitle) || searchTitle.includes(slugify(s.title)));
        if (!found) found = allSubs.find(s => slugify(s.thematic_title + " " + s.title).includes(searchTitle));

        if (found) {
          subId = found.sub_thematic_id;
        }
      }

      if (!subId || isNaN(Number(subId))) {
        console.warn(`Row ${i + 1} skipped: Quiz "${stTitle}" not found and no valid default selected`);
        skippedCount++;
        continue;
      }

      const opt1 = row[idx.option1]?.toString().trim() || "";
      const opt2 = idx.option2 !== -1 ? row[idx.option2]?.toString().trim() : "";
      const opt3 = idx.option3 !== -1 ? row[idx.option3]?.toString().trim() : "";
      
      let correctIdx = Number(row[idx.correct_option]);
       
       // Si la bonne réponse n'est pas un index (1, 2, 3), on cherche par texte
       if (isNaN(correctIdx) || correctIdx < 1 || correctIdx > 3) {
         const correctVal = row[idx.correct_option]?.toString().trim().toLowerCase();
         // Support des formats "1", "2", "3" même en texte, ou du texte complet de la réponse
         if (correctVal === "1" || correctVal === "réponse 1" || correctVal === "reponse 1" || correctVal === opt1.toLowerCase()) correctIdx = 1;
         else if (correctVal === "2" || correctVal === "réponse 2" || correctVal === "reponse 2" || correctVal === opt2.toLowerCase()) correctIdx = 2;
         else if (correctVal === "3" || correctVal === "réponse 3" || correctVal === "reponse 3" || correctVal === opt3.toLowerCase()) correctIdx = 3;
         else correctIdx = 1; // Par défaut
       }

      await quizModel.createQuestionWithAnswers({
        sub_thematic_id: subId,
        content: content,
        explanation: idx.explanation !== -1 ? row[idx.explanation]?.toString().trim() : "",
        difficulty_level: idx.difficulty !== -1 ? row[idx.difficulty]?.toString().trim() : "moyen",
        points: idx.points !== -1 ? Number(row[idx.points]) || 10 : 10,
        time_limit: idx.time_limit !== -1 ? Number(row[idx.time_limit]) || 30 : 30,
        media_url: idx.media_url !== -1 ? row[idx.media_url]?.toString().trim() : null,
        answer_option1: opt1,
        answer_option2: opt2,
        answer_option3: opt3,
        correct_option: correctIdx,
        answer_type: 'text',
        points_value: 1
      });
      createdCount++;
    }

    if (req.user) {
      await logModeratorAction({
        moderator_id: req.user.user_id,
        action_type: "import_questions",
        target_type: "question",
        target_id: null,
        details: `Importation de ${createdCount} questions (${skippedCount} ignorées)`
      });
    }

    res.status(200).json({
      message: createdCount > 0 ? "Importation réussie" : "Aucune question n'a été importée. Vérifiez les titres des quiz.",
      details: { 
        questions_created: createdCount,
        questions_skipped: skippedCount
      }
    });
  } catch (error) {
    console.error("❌ importQuestions:", error);
    res.status(500).json({ error: error.message });
  }
};
