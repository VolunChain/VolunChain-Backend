import { Router } from "express";
import { MessagingModuleFactory } from "../factories/messaging.factory";
import { authMiddleware } from "../../../middleware/authMiddleware";

const router = Router();

const messagingController = MessagingModuleFactory.createMessagingController();

router.use(authMiddleware);

// POST /messages - Send a new message
router.post("/", (req, res) => messagingController.sendMessage(req, res));

// GET /messages/:volunteerId - Get conversation for a volunteer event
router.get("/:volunteerId", (req, res) =>
  messagingController.getConversation(req, res)
);

// PATCH /messages/:id/read - Mark message as read
router.patch("/:id/read", (req, res) =>
  messagingController.markAsRead(req, res)
);

export default router;
