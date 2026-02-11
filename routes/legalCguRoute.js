import express from "express";
import { listCGU, cguById, addCGU, editCGU, removeCGU } from "../controllers/cguController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();
router.get("/legal/cgu", listCGU);
router.get("/legal/cgu/:id", cguById);
router.post("/legal/cgu", authenticateToken, authorizeRole(["admin","moderator"]), addCGU);
router.put("/legal/cgu/:id", authenticateToken, authorizeRole(["admin","moderator"]), editCGU);
router.delete("/legal/cgu/:id", authenticateToken, authorizeRole(["admin"]), removeCGU);

export default router;