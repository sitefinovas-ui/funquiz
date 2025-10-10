import express from "express";
import { listContacts, contactById, addContact, editContact, removeContact } from "../controllers/contactController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();
router.get("/legal/contact", listContacts);
router.get("/legal/contact/:id", authenticateToken, authorizeRole(["admin","moderator"]), contactById);
router.post("/legal/contact",authenticateToken, authorizeRole(["admin"]), addContact); // formulaire public
router.put("/legal/contact/:id", authenticateToken, authorizeRole(["admin","moderator"]), editContact);
router.delete("/legal/contact/:id", authenticateToken, authorizeRole(["admin"]), removeContact);

export default router;