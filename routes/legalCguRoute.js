import express from "express";
import { listCGU, cguById, addCGU, editCGU, removeCGU } from "../controllers/cguController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();
router.get("/", listCGU);
router.get("/:id", cguById);
router.post("/", authenticateToken, authorizeRole(["admin","moderator"]), addCGU);
router.put("/:id", authenticateToken, authorizeRole(["admin","moderator"]), editCGU);
router.delete("/:id", authenticateToken, authorizeRole(["admin"]), removeCGU);

export default router;