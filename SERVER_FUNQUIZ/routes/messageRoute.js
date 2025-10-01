import express from "express";
import {
  allMessageData,
  MessageById,
  addMessage,
  editMessage,
  removeMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/messages", allMessageData);
router.get("/messages/:message_id", MessageById);
router.post("/messages", addMessage);
router.put("/messages/:message_id", editMessage);
router.delete("/messages/:message_id", removeMessage);

export default router;
