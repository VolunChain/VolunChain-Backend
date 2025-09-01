import { MessagingModuleFactory } from "../../factories/messaging.factory";
import { MessagingService } from "../../application/services/MessagingService";
import { MessagingController } from "../../controllers/MessagingController";
import { MessagePrismaRepository } from "../../repositories/implementations/message-prisma.repository";
import { PrismaClient } from "@prisma/client";

// Mock the dependencies
jest.mock("../../application/services/MessagingService");
jest.mock("../../controllers/MessagingController");
jest.mock("../../repositories/implementations/message-prisma.repository");
jest.mock("@prisma/client");

describe("MessagingModuleFactory", () => {
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockMessageRepository: jest.Mocked<MessagePrismaRepository>;
  let mockMessagingService: jest.Mocked<MessagingService>;
  let mockMessagingController: jest.Mocked<MessagingController>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock instances
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    mockMessageRepository = new MessagePrismaRepository(mockPrisma) as jest.Mocked<MessagePrismaRepository>;
    mockMessagingService = new MessagingService(mockMessageRepository, mockPrisma) as jest.Mocked<MessagingService>;
    mockMessagingController = new MessagingController(mockMessagingService) as jest.Mocked<MessagingController>;

    // Mock the constructors
    (PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);
    (MessagePrismaRepository as jest.Mock).mockImplementation(() => mockMessageRepository);
    (MessagingService as jest.Mock).mockImplementation(() => mockMessagingService);
    (MessagingController as jest.Mock).mockImplementation(() => mockMessagingController);
  });

  describe("createMessagingController", () => {
    it("should create a messaging controller with all required dependencies", () => {
      const messagingController = MessagingModuleFactory.createMessagingController();

      expect(messagingController).toBeDefined();
      expect(messagingController).toBeInstanceOf(MessagingController);

      // Verify constructors were called with correct dependencies
      expect(PrismaClient).toHaveBeenCalledTimes(1);
      expect(MessagePrismaRepository).toHaveBeenCalledWith(mockPrisma);
      expect(MessagingService).toHaveBeenCalledWith(mockMessageRepository, mockPrisma);
      expect(MessagingController).toHaveBeenCalledWith(mockMessagingService);
    });

    it("should return different instances on each call", () => {
      const firstInstance = MessagingModuleFactory.createMessagingController();
      const secondInstance = MessagingModuleFactory.createMessagingController();

      expect(firstInstance).not.toBe(secondInstance);
      expect(MessagingController).toHaveBeenCalledTimes(2);
    });

    it("should create dependencies with proper wiring", () => {
      const messagingController = MessagingModuleFactory.createMessagingController();

      // Verify the controller has the expected methods
      expect(typeof messagingController.sendMessage).toBe("function");
      expect(typeof messagingController.getConversation).toBe("function");
      expect(typeof messagingController.markAsRead).toBe("function");
    });
  });
});
