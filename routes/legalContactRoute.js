import express from "express";
import { listContacts, contactById, addContact, editContact, removeContact } from "../controllers/contactController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();
router.get("/", listContacts);
router.get("/:id", authenticateToken, authorizeRole(["admin","moderator"]), contactById);
router.post("/", addContact); // formulaire public
router.put("/:id", authenticateToken, authorizeRole(["admin","moderator"]), editContact);
router.delete("/:id", authenticateToken, authorizeRole(["admin"]), removeContact);

export default router;