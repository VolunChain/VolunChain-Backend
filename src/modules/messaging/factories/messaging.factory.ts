import { MessagingService } from "../application/services/MessagingService";
import { MessagingController } from "../controllers/MessagingController";
import { MessagePrismaRepository } from "../repositories/implementations/message-prisma.repository";
import { PrismaClient } from "@prisma/client";

export class MessagingModuleFactory {
  static createMessagingController(): MessagingController {
    const prisma = new PrismaClient();
    const messageRepository = new MessagePrismaRepository(prisma);
    const messagingService = new MessagingService(messageRepository, prisma);
    return new MessagingController(messagingService);
  }
}
