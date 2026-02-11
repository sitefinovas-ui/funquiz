import express from "express";
import { authenticateToken } from "../middleware/authentification.js";
import {
  listConversations,
  getThread,
  sendMessage,
  markRead,
} from "../controllers/privateMessageController.js";

const router = express.Router();

router.get("/private-messages/conversations", authenticateToken, listConversations);
router.get("/private-messages/with/:userId", authenticateToken, getThread);
router.post("/private-messages", authenticateToken, sendMessage);
router.post("/private-messages/read", authenticateToken, markRead);

export default router;
