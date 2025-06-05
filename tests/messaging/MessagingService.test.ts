import { MessagingService } from '../../src/modules/messaging/services/MessagingService';
import { IMessageRepository } from '../../src/modules/messaging/repositories/interfaces/message-repository.interface';
import { Message } from '../../src/modules/messaging/domain/entities/message.entity';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
const mockPrisma = {
  userVolunteer: {
    findFirst: jest.fn(),
  },
} as unknown as PrismaClient;

// Mock Message Repository
const mockMessageRepository: jest.Mocked<IMessageRepository> = {
  create: jest.fn(),
  findConversationByVolunteerId: jest.fn(),
  markAsRead: jest.fn(),
  findById: jest.fn(),
  isUserParticipantInConversation: jest.fn(),
};

describe('MessagingService', () => {
  let messagingService: MessagingService;

  beforeEach(() => {
    messagingService = new MessagingService(mockMessageRepository, mockPrisma);
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    const mockMessage = new Message(
      'message-id',
      'Hello world',
      new Date(),
      null,
      'sender-id',
      'receiver-id',
      'volunteer-id'
    );

    it('should send a message successfully when both users are participants', async () => {
      // Arrange
      (mockPrisma.userVolunteer.findFirst as jest.Mock)
        .mockResolvedValueOnce({ userId: 'sender-id', volunteerId: 'volunteer-id' }) // sender participation
        .mockResolvedValueOnce({ userId: 'receiver-id', volunteerId: 'volunteer-id' }); // receiver participation
      
      mockMessageRepository.create.mockResolvedValue(mockMessage);

      // Act
      const result = await messagingService.sendMessage(
        'Hello world',
        'sender-id',
        'receiver-id',
        'volunteer-id'
      );

      // Assert
      expect(mockPrisma.userVolunteer.findFirst).toHaveBeenCalledTimes(2);
      expect(mockPrisma.userVolunteer.findFirst).toHaveBeenCalledWith({
        where: { userId: 'sender-id', volunteerId: 'volunteer-id' },
      });
      expect(mockPrisma.userVolunteer.findFirst).toHaveBeenCalledWith({
        where: { userId: 'receiver-id', volunteerId: 'volunteer-id' },
      });
      expect(mockMessageRepository.create).toHaveBeenCalledWith(
        'Hello world',
        'sender-id',
        'receiver-id',
        'volunteer-id'
      );
      expect(result).toEqual(mockMessage);
    });

    it('should throw error when sender is not a participant', async () => {
      // Arrange
      (mockPrisma.userVolunteer.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // sender not found
        .mockResolvedValueOnce({ userId: 'receiver-id', volunteerId: 'volunteer-id' }); // receiver participation

      // Act & Assert
      await expect(
        messagingService.sendMessage(
          'Hello world',
          'sender-id',
          'receiver-id',
          'volunteer-id'
        )
      ).rejects.toThrow('Sender is not a participant in this volunteer event');

      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when receiver is not a participant', async () => {
      // Arrange
      (mockPrisma.userVolunteer.findFirst as jest.Mock)
        .mockResolvedValueOnce({ userId: 'sender-id', volunteerId: 'volunteer-id' }) // sender participation
        .mockResolvedValueOnce(null); // receiver not found

      // Act & Assert
      await expect(
        messagingService.sendMessage(
          'Hello world',
          'sender-id',
          'receiver-id',
          'volunteer-id'
        )
      ).rejects.toThrow('Receiver is not a participant in this volunteer event');

      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when both users are not participants', async () => {
      // Arrange
      (mockPrisma.userVolunteer.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // sender not found
        .mockResolvedValueOnce(null); // receiver not found

      // Act & Assert
      await expect(
        messagingService.sendMessage(
          'Hello world',
          'sender-id',
          'receiver-id',
          'volunteer-id'
        )
      ).rejects.toThrow('Sender is not a participant in this volunteer event');

      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getConversation', () => {
    const mockMessages = [
      new Message('msg1', 'Hello', new Date(), null, 'user1', 'user2', 'volunteer-id'),
      new Message('msg2', 'Hi there', new Date(), null, 'user2', 'user1', 'volunteer-id'),
    ];

    it('should retrieve conversation successfully when user is participant', async () => {
      // Arrange
      (mockPrisma.userVolunteer.findFirst as jest.Mock)
        .mockResolvedValue({ userId: 'user-id', volunteerId: 'volunteer-id' });
      
      mockMessageRepository.findConversationByVolunteerId.mockResolvedValue(mockMessages);

      // Act
      const result = await messagingService.getConversation('volunteer-id', 'user-id', 1, 50);

      // Assert
      expect(mockPrisma.userVolunteer.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-id', volunteerId: 'volunteer-id' },
      });
      expect(mockMessageRepository.findConversationByVolunteerId).toHaveBeenCalledWith(
        'volunteer-id',
        'user-id',
        1,
        50
      );
      expect(result).toEqual(mockMessages);
    });

    it('should throw error when user is not a participant', async () => {
      // Arrange
      (mockPrisma.userVolunteer.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        messagingService.getConversation('volunteer-id', 'user-id', 1, 50)
      ).rejects.toThrow('User is not a participant in this volunteer event');

      expect(mockMessageRepository.findConversationByVolunteerId).not.toHaveBeenCalled();
    });

    it('should use default pagination parameters', async () => {
      // Arrange
      (mockPrisma.userVolunteer.findFirst as jest.Mock)
        .mockResolvedValue({ userId: 'user-id', volunteerId: 'volunteer-id' });
      
      mockMessageRepository.findConversationByVolunteerId.mockResolvedValue(mockMessages);

      // Act
      await messagingService.getConversation('volunteer-id', 'user-id');

      // Assert
      expect(mockMessageRepository.findConversationByVolunteerId).toHaveBeenCalledWith(
        'volunteer-id',
        'user-id',
        1, // default page
        50 // default limit
      );
    });
  });

  describe('markMessageAsRead', () => {
    const mockMessage = new Message(
      'message-id',
      'Hello world',
      new Date(),
      new Date(), // readAt is set
      'sender-id',
      'receiver-id',
      'volunteer-id'
    );

    it('should mark message as read successfully when user is participant', async () => {
      // Arrange
      mockMessageRepository.isUserParticipantInConversation.mockResolvedValue(true);
      mockMessageRepository.markAsRead.mockResolvedValue(mockMessage);

      // Act
      const result = await messagingService.markMessageAsRead('message-id', 'user-id');

      // Assert
      expect(mockMessageRepository.isUserParticipantInConversation).toHaveBeenCalledWith(
        'message-id',
        'user-id'
      );
      expect(mockMessageRepository.markAsRead).toHaveBeenCalledWith('message-id', 'user-id');
      expect(result).toEqual(mockMessage);
    });

    it('should throw error when user is not a participant in conversation', async () => {
      // Arrange
      mockMessageRepository.isUserParticipantInConversation.mockResolvedValue(false);

      // Act & Assert
      await expect(
        messagingService.markMessageAsRead('message-id', 'user-id')
      ).rejects.toThrow('Unauthorized: You cannot access this message');

      expect(mockMessageRepository.markAsRead).not.toHaveBeenCalled();
    });

    it('should throw error when message is not found or user cannot mark it as read', async () => {
      // Arrange
      mockMessageRepository.isUserParticipantInConversation.mockResolvedValue(true);
      mockMessageRepository.markAsRead.mockResolvedValue(null);

      // Act & Assert
      await expect(
        messagingService.markMessageAsRead('message-id', 'user-id')
      ).rejects.toThrow('Message not found or you are not authorized to mark it as read');
    });
  });

  describe('validateParticipants (private method testing through sendMessage)', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      (mockPrisma.userVolunteer.findFirst as jest.Mock)
        .mockRejectedValue(new Error('Database connection error'));

      // Act & Assert
      await expect(
        messagingService.sendMessage(
          'Hello world',
          'sender-id',
          'receiver-id',
          'volunteer-id'
        )
      ).rejects.toThrow('Database connection error');
    });
  });

  describe('validateUserParticipation (private method testing through getConversation)', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      (mockPrisma.userVolunteer.findFirst as jest.Mock)
        .mockRejectedValue(new Error('Database connection error'));

      // Act & Assert
      await expect(
        messagingService.getConversation('volunteer-id', 'user-id')
      ).rejects.toThrow('Database connection error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty message content', async () => {
      // Arrange
      (mockPrisma.userVolunteer.findFirst as jest.Mock)
        .mockResolvedValueOnce({ userId: 'sender-id', volunteerId: 'volunteer-id' })
        .mockResolvedValueOnce({ userId: 'receiver-id', volunteerId: 'volunteer-id' });
      
      const mockMessage = new Message(
        'message-id',
        '',
        new Date(),
        null,
        'sender-id',
        'receiver-id',
        'volunteer-id'
      );
      
      mockMessageRepository.create.mockResolvedValue(mockMessage);

      // Act
      const result = await messagingService.sendMessage(
        '',
        'sender-id',
        'receiver-id',
        'volunteer-id'
      );

      // Assert
      expect(result.content).toBe('');
      expect(mockMessageRepository.create).toHaveBeenCalledWith(
        '',
        'sender-id',
        'receiver-id',
        'volunteer-id'
      );
    });

    it('should handle invalid pagination parameters', async () => {
      // Arrange
      (mockPrisma.userVolunteer.findFirst as jest.Mock)
        .mockResolvedValue({ userId: 'user-id', volunteerId: 'volunteer-id' });
      
      mockMessageRepository.findConversationByVolunteerId.mockResolvedValue([]);

      // Act
      await messagingService.getConversation('volunteer-id', 'user-id', -1, -10);

      // Assert
      expect(mockMessageRepository.findConversationByVolunteerId).toHaveBeenCalledWith(
        'volunteer-id',
        'user-id',
        -1,
        -10
      );
    });
  });
});