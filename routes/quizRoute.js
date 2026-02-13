import express from "express";
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
  createQuestion,
  updateQuestion,
  updateQuestionAnswers,
  deleteQuestion,
  getAllSubThematics,
  getSubThematicById,
  createSubThematic,
  updateSubThematic,
  deleteSubThematic,
} from "../controllers/quizController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();

// Quiz data routes
router.get("/quiz/allquiz", allQuizData);
router.get("/quiz/thematic/:thematic_id/subthematics", getSubThematics);
router.get("/quiz/subthematic/:sub_thematic_id/questions", getQuestions);
router.get("/quiz/question/:question_id/answers", getAnswers);

// Quiz gameplay
router.post("/quiz/answer/:user_id", validateAnswer);

// Points & Ranking
router.get("/point/:user_id", getUserPoints);
router.get("/ranking", getAllUsersPoints);

// Thematic CRUD
router.get("/param/thematics", getAllThematics);
router.get("/param/thematics/:id", getThematicById);
router.post("/param/thematics", upload.single("icon"), createThematic);
router.put("/param/thematics/:id", upload.single("icon"), updateThematic);
router.delete(
  "/param/thematics/purge",
  authenticateToken,
  authorizeRole(["admin"]),
  purgeThematics
);
router.delete("/param/thematics/:id", deleteThematic);

// Sub-thematic CRUD
router.get("/param/subthematics", getAllSubThematics);
router.get("/param/subthematics/:id", getSubThematicById);
router.post(
  "/param/subthematics",
  authenticateToken,
  authorizeRole(["admin", "moderator"]),
  createSubThematic
);
router.put(
  "/param/subthematics/:id",
  authenticateToken,
  authorizeRole(["admin", "moderator"]),
  updateSubThematic
);
router.delete(
  "/param/subthematics/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  deleteSubThematic
);

// Questions CRUD
router.post(
  "/param/questions",
  authenticateToken,
  authorizeRole(["admin", "moderator"]),
  createQuestion
);
router.put(
  "/param/questions/:question_id",
  authenticateToken,
  authorizeRole(["admin", "moderator"]),
  updateQuestion
);
router.put(
  "/param/questions/:question_id/answers",
  authenticateToken,
  authorizeRole(["admin", "moderator"]),
  updateQuestionAnswers
);
router.delete(
  "/param/questions/:question_id",
  authenticateToken,
  authorizeRole(["admin"]),
  deleteQuestion
);

export default router;
