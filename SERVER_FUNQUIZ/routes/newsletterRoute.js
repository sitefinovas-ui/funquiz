import express from "express";
import {
  allNewsletters,
  newsletterById,
  addNewsletter,
  removeNewsletter,
} from "../controllers/newsletterController.js";
import { authenticateToken, authorizeRole } from "../middleware/authentification.js";

const router = express.Router();

// Newsletter routes
router.get("/newsletters", allNewsletters); 
router.get("/newsletters/:id", authenticateToken, newsletterById); 
router.post("/newsletters", addNewsletter); 
router.delete("/newsletters/:id", authenticateToken, authorizeRole(["admin"]), removeNewsletter); 

export default router;  