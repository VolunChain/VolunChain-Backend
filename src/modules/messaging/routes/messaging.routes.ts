import { Router } from 'express';
import { MessagingController } from '../controllers/MessagingController';
import { MessagingService } from '../services/MessagingService';
import { MessagePrismaRepository } from '../repositories/implementations/message-prisma.repository';
import {authMiddleware} from '../../../middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const messageRepository = new MessagePrismaRepository(prisma);
const messagingService = new MessagingService(messageRepository, prisma);
const messagingController = new MessagingController(messagingService);

router.use(authMiddleware);

// POST /messages - Send a new message
router.post('/', (req, res) => messagingController.sendMessage(req, res));

// GET /messages/:volunteerId - Get conversation for a volunteer event
router.get('/:volunteerId', (req, res) => messagingController.getConversation(req, res));

// PATCH /messages/:id/read - Mark message as read
router.patch('/:id/read', (req, res) => messagingController.markAsRead(req, res));

export default router;