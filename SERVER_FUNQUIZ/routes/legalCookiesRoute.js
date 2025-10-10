import express from "express";
import { listCookies, cookiesById, addCookies, editCookies, removeCookies } from "../controllers/cookiesPolicyController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();
router.get("/legal/cookies", listCookies);
router.get("/legal/cookies/:id", cookiesById);
router.post("/legal/cookies", authenticateToken, authorizeRole(["admin","moderator"]), addCookies);
router.put("/legal/cookies/:id", authenticateToken, authorizeRole(["admin","moderator"]), editCookies);
router.delete("/legal/cookies/:id", authenticateToken, authorizeRole(["admin"]), removeCookies);

export default router;