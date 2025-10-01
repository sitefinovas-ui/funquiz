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
deleteThematic
} from "../controllers/quizController.js";

const router = express.Router();

// Quiz data routes
router.get("/quiz/allquiz", allQuizData);
router.get("/quiz/thematic/:thematic_id/subthematics", getSubThematics);
router.get("/quiz/subthematic/:sub_thematic_id/questions", getQuestions);
router.get("/quiz/question/:question_id/answers", getAnswers);

// Quiz gameplay
router.post('/quiz/answer/:user_id', validateAnswer);

// Points & Ranking
router.get("/point/:user_id", getUserPoints);
router.get("/ranking", getAllUsersPoints);

// Thematic CRUD
router.get("/param/thematics", getAllThematics);
router.get("/param/thematics/:id", getThematicById);
router.post("/param/thematics", upload.single("icon"), createThematic);
router.put("/param/thematics/:id", upload.single("icon"), updateThematic);
router.delete("/param/thematics/:id", deleteThematic);

export default router;