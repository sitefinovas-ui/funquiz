import express from "express";
import multer from "multer";
import upload from "../config/multer.js";
import {
  allQuizData,
  validateAnswer,
  getUserPoints,
  getAllUsersPoints,
  getSubThematics,
  getQuestions,
  getAnswers,
  getAllThematics,
  getThematicById,
  createThematic,
  updateThematic,
  deleteThematic,
  purgeThematics,
  importThematics,
  createQuestion,
  updateQuestion,
  updateQuestionAnswers,
  deleteQuestion,
  importQuestions,
  getAllSubThematics,
  getSubThematicById,
  createSubThematic,
  updateSubThematic,
  deleteSubThematic,
} from "../controllers/quizController.js";
import { authenticateToken, authorizeRole, hasPermission } from "../middleware/authentification.js";

const router = express.Router();

// Configuration Multer spécifique pour l'importation (en mémoire)
const importUpload = multer({ storage: multer.memoryStorage() });

// Quiz data routes
router.get("/quiz/allquiz", allQuizData);
router.get("/quiz/thematic/:thematic_id/subthematics", getSubThematics);
router.get("/quiz/subthematic/:sub_thematic_id/questions", getQuestions);
router.get("/quiz/question/:question_id/answers", getAnswers);

// Quiz gameplay
router.post("/quiz/answer/:user_id", authenticateToken, validateAnswer);

// Points & Ranking
router.get("/point/:user_id", getUserPoints);
router.get("/ranking", getAllUsersPoints);

// Thematic CRUD
router.get("/param/thematics", getAllThematics);
router.get("/param/thematics/:id", getThematicById);
router.post("/param/thematics", authenticateToken, hasPermission("quiz_edit"), upload.single("icon"), createThematic);
router.put("/param/thematics/:id", authenticateToken, hasPermission("quiz_edit"), upload.single("icon"), updateThematic);
router.delete(
  "/param/thematics/purge",
  authenticateToken,
  authorizeRole(["admin"]),
  purgeThematics
);
router.delete("/param/thematics/:id", authenticateToken, hasPermission("quiz_delete"), deleteThematic);
router.post(
  "/param/thematics/import",
  authenticateToken,
  authorizeRole(["admin"]),
  importUpload.single("file"),
  importThematics
);

// Sub-thematic CRUD
router.get("/param/subthematics", getAllSubThematics);
router.get("/param/subthematics/:id", getSubThematicById);
router.post(
  "/param/subthematics",
  authenticateToken,
  hasPermission("quiz_edit"),
  createSubThematic
);
router.put(
  "/param/subthematics/:id",
  authenticateToken,
  hasPermission("quiz_edit"),
  updateSubThematic
);
router.delete(
  "/param/subthematics/:id",
  authenticateToken,
  hasPermission("quiz_delete"),
  deleteSubThematic
);

// Questions CRUD
router.post(
  "/param/questions",
  authenticateToken,
  hasPermission("quiz_edit"),
  upload.single("media"),
  createQuestion
);
router.post(
  "/param/questions/answers",
  authenticateToken,
  hasPermission("quiz_edit"),
  updateQuestionAnswers
);
router.put(
  "/param/questions/:question_id",
  authenticateToken,
  hasPermission("quiz_edit"),
  upload.single("media"),
  updateQuestion
);
router.put(
  "/param/questions/:question_id/answers",
  authenticateToken,
  hasPermission("quiz_edit"),
  updateQuestionAnswers
);
router.delete(
  "/param/questions/:question_id",
  authenticateToken,
  hasPermission("quiz_delete"),
  deleteQuestion
);
router.post(
  "/param/questions/import",
  authenticateToken,
  authorizeRole(["admin"]),
  importUpload.single("file"),
  importQuestions
);

export default router;
