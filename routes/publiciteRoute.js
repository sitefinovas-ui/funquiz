import express from "express";
import {
  listPublicites,
  getPublicite,
  createPubliciteCtrl,
  updatePubliciteCtrl,
  deletePubliciteCtrl,
} from "../controllers/publiciteController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();

router.get("/publicites", listPublicites);
router.get("/publicites/:id", getPublicite);
router.post("/publicites",
  authenticateToken,
  authorizeRole(["admin"]),
  createPubliciteCtrl
);
router.put("/publicites/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  updatePubliciteCtrl
);
router.delete("/publicites/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  deletePubliciteCtrl
);

export default router;