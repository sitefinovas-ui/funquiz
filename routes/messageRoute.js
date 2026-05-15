import express from "express";
import {
  allMessageData,
  MessageById,
  addMessage,
  editMessage,
  removeMessage,
  sendEmailDirect,
} from "../controllers/messageController.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middleware/authentification.js";

const router = express.Router();

router.post("/messages", addMessage);
router.get("/messages", authenticateToken, authorizeRole(["admin", "moderator"]), allMessageData);
router.get("/messages/:message_id", authenticateToken, authorizeRole(["admin", "moderator"]), MessageById);
router.put("/messages/:message_id", authenticateToken, authorizeRole(["admin", "moderator"]), editMessage);
router.delete("/messages/:message_id", authenticateToken, authorizeRole(["admin", "moderator"]), removeMessage);
router.post(
  "/messages/send-email",
  authenticateToken,
  authorizeRole(["admin"]),
  sendEmailDirect,
);

export default router;
