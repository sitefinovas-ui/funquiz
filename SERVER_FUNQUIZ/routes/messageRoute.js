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

router.get("/messages", allMessageData);
router.get("/messages/:message_id", MessageById);
router.post("/messages", addMessage);
router.put("/messages/:message_id", editMessage);
router.delete("/messages/:message_id", removeMessage);
router.post(
  "/messages/send-email",
  authenticateToken,
  authorizeRole(["admin"]),
  sendEmailDirect,
);

export default router;
