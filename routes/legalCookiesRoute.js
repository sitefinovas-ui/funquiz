import express from "express";
import { listCookies, cookiesById, addCookies, editCookies, removeCookies } from "../controllers/cookiesPolicyController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();
router.get("/", listCookies);
router.get("/:id", cookiesById);
router.post("/", authenticateToken, authorizeRole(["admin","moderator"]), addCookies);
router.put("/:id", authenticateToken, authorizeRole(["admin","moderator"]), editCookies);
router.delete("/:id", authenticateToken, authorizeRole(["admin"]), removeCookies);

export default router;