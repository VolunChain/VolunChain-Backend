import { MessagePrismaRepository } from '../../src/modules/messaging/repositories/implementations/message-prisma.repository';
import { PrismaClient } from '@prisma/client';
import { Message } from '../../src/modules/messaging/domain/entities/message.entity';

// Mock PrismaClient
const mockPrisma = {
  message: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
} as unknown as PrismaClient;

describe('MessagePrismaRepository', () => {
  let repository: MessagePrismaRepository;

  beforeEach(() => {
    repository = new MessagePrismaRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a message successfully', async () => {
      // Arrange
      const mockPrismaMessage = {
        id: 'message-id',
        content: 'Hello world',
        sentAt: new Date('2023-01-01T10:00:00Z'),
        readAt: null,
        senderId: 'sender-id',
        receiverId: 'receiver-id',
        volunteerId: 'volunteer-id',
      };

      (mockPrisma.message.create as jest.Mock).mockResolvedValue(mockPrismaMessage);

      // Act
      const result = await repository.create(
        'Hello world',
        'sender-id',
        'receiver-id',
        'volunteer-id'
      );

      // Assert
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          content: 'Hello world',
          senderId: 'sender-id',
          receiverId: 'receiver-id',
          volunteerId: 'volunteer-id',
        },
      });

      expect(result).toBeInstanceOf(Message);
      expect(result.id).toBe('message-id');
      expect(result.content).toBe('Hello world');
      expect(result.senderId).toBe('sender-id');
      expect(result.receiverId).toBe('receiver-id');
      expect(result.volunteerId).toBe('volunteer-id');
    });

    it('should handle database errors', async () => {
      // Arrange
      (mockPrisma.message.create as jest.Mock).mockRejectedValue(
        new Error('Database connection error')
      );

      // Act & Assert
      await expect(
        repository.create('Hello world', 'sender-id', 'receiver-id', 'volunteer-id')
      ).rejects.toThrow('Database connection error');
    });
  });

  describe('findConversationByVolunteerId', () => {
    it('should find conversation messages with default pagination', async () => {
      // Arrange
      const mockMessages = [
        {
          id: 'msg1',
          content: 'Hello',
          sentAt: new Date('2023-01-01T10:00:00Z'),
          readAt: null,
          senderId: 'user1',
          receiverId: 'user2',
          volunteerId: 'volunteer-id',
          sender: { id: 'user1', name: 'John' },
          receiver: { id: 'user2', name: 'Jane' },
        },
        {
          id: 'msg2',
          content: 'Hi there',
          sentAt: new Date('2023-01-01T11:00:00Z'),
          readAt: new Date('2023-01-01T11:30:00Z'),
          senderId: 'user2',
          receiverId: 'user1',
          volunteerId: 'volunteer-id',
          sender: { id: 'user2', name: 'Jane' },
          receiver: { id: 'user1', name: 'John' },
        },
      ];

      (mockPrisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      // Act
      const result = await repository.findConversationByVolunteerId(
        'volunteer-id',
        'user1'
      );

      // Assert
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: {
          volunteerId: 'volunteer-id',
          OR: [
            { senderId: 'user1' },
            { receiverId: 'user1' }
          ],
        },
        orderBy: {
          sentAt: 'asc',
        },
        skip: 0, // default page 1
        take: 50, // default limit
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Message);
      expect(result[0].id).toBe('msg1');
      expect(result[1].id).toBe('msg2');
    });

    it('should handle custom pagination parameters', async () => {
      // Arrange
      (mockPrisma.message.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      await repository.findConversationByVolunteerId(
        'volunteer-id',
        'user1',
        3, // page 3
        20 // limit 20
      );

      // Assert
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: {
          volunteerId: 'volunteer-id',
          OR: [
            { senderId: 'user1' },
            { receiverId: 'user1' }
          ],
        },
        orderBy: {
          sentAt: 'asc',
        },
        skip: 40, // (3-1) * 20
        take: 20,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should return empty array when no messages found', async () => {
      // Arrange
      (mockPrisma.message.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.findConversationByVolunteerId(
        'volunteer-id',
        'user1'
      );

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read successfully', async () => {
      // Arrange
      const mockMessage = {
        id: 'message-id',
        content: 'Hello',
        sentAt: new Date('2023-01-01T10:00:00Z'),
        readAt: null,
        senderId: 'sender-id',
        receiverId: 'user-id',
        volunteerId: 'volunteer-id',
      };

      const mockUpdatedMessage = {
        ...mockMessage,
        readAt: new Date('2023-01-01T11:00:00Z'),
      };

      (mockPrisma.message.findFirst as jest.Mock).mockResolvedValue(mockMessage);
      (mockPrisma.message.update as jest.Mock).mockResolvedValue(mockUpdatedMessage);

      // Act
      const result = await repository.markAsRead('message-id', 'user-id');

      // Assert
      expect(mockPrisma.message.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'message-id',
          receiverId: 'user-id',
        },
      });

      expect(mockPrisma.message.update).toHaveBeenCalledWith({
        where: {
          id: 'message-id',
        },
        data: {
          readAt: expect.any(Date),
        },
      });

      expect(result).toBeInstanceOf(Message);
      expect(result?.readAt).toBeTruthy();
    });

    it('should return null when user is not the receiver', async () => {
      // Arrange
      (mockPrisma.message.findFirst as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await repository.markAsRead('message-id', 'wrong-user-id');

      // Assert
      expect(mockPrisma.message.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'message-id',
          receiverId: 'wrong-user-id',
        },
      });

      expect(mockPrisma.message.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when message does not exist', async () => {
      // Arrange
      (mockPrisma.message.findFirst as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await repository.markAsRead('non-existent-id', 'user-id');

      // Assert
      expect(result).toBeNull();
      expect(mockPrisma.message.update).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find message by id successfully', async () => {
      // Arrange
      const mockMessage = {
        id: 'message-id',
        content: 'Hello',
        sentAt: new Date('2023-01-01T10:00:00Z'),
        readAt: null,
        senderId: 'sender-id',
        receiverId: 'receiver-id',
        volunteerId: 'volunteer-id',
      };

      (mockPrisma.message.findUnique as jest.Mock).mockResolvedValue(mockMessage);

      // Act
      const result = await repository.findById('message-id');

      // Assert
      expect(mockPrisma.message.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'message-id',
        },
      });

      expect(result).toBeInstanceOf(Message);
      expect(result?.id).toBe('message-id');
    });

    it('should return null when message not found', async () => {
      // Arrange
      (mockPrisma.message.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await repository.findById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('isUserParticipantInConversation', () => {
    it('should return true when user is sender', async () => {
      // Arrange
      const mockMessage = {
        id: 'message-id',
        senderId: 'user-id',
        receiverId: 'other-user-id',
      };

      (mockPrisma.message.findFirst as jest.Mock).mockResolvedValue(mockMessage);

      // Act
      const result = await repository.isUserParticipantInConversation(
        'message-id',
        'user-id'
      );

      // Assert
      expect(mockPrisma.message.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'message-id',
          OR: [
            { senderId: 'user-id' },
            { receiverId: 'user-id' }
          ],
        },
      });

      expect(result).toBe(true);
    });

    it('should return true when user is receiver', async () => {
      // Arrange
      const mockMessage = {
        id: 'message-id',
        senderId: 'other-user-id',
        receiverId: 'user-id',
      };

      (mockPrisma.message.findFirst as jest.Mock).mockResolvedValue(mockMessage);

      // Act
      const result = await repository.isUserParticipantInConversation(
        'message-id',
        'user-id'
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user is not participant', async () => {
      // Arrange
      (mockPrisma.message.findFirst as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await repository.isUserParticipantInConversation(
        'message-id',
        'non-participant-id'
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle database errors in findConversationByVolunteerId', async () => {
      // Arrange
      (mockPrisma.message.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      // Act & Assert
      await expect(
        repository.findConversationByVolunteerId('volunteer-id', 'user-id')
      ).rejects.toThrow('Database error');
    });

    it('should handle database errors in markAsRead', async () => {
      // Arrange
      (mockPrisma.message.findFirst as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      // Act & Assert
      await expect(
        repository.markAsRead('message-id', 'user-id')
      ).rejects.toThrow('Database error');
    });
  });
});