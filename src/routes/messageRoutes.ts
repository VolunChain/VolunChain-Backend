import { Router } from "express";
import {
  sendMessage,
  getMessagesForVolunteer,
  markMessageAsRead,
} from "../controllers/MessageController";

const router = Router();

router.post("/messages", sendMessage);
router.get("/volunteer/:volunteerId", getMessagesForVolunteer);
router.patch("/messages/:id/read", markMessageAsRead);

export default router;
