import { IMessageRepository } from '../repositories/interfaces/message-repository.interface';
import { Message } from '../domain/entities/message.entity';
import { PrismaClient } from '@prisma/client';

export class MessagingService {
  constructor(
    private messageRepository: IMessageRepository,
    private prisma: PrismaClient
  ) {}

  async sendMessage(
    content: string,
    senderId: string,
    receiverId: string,
    volunteerId: string
  ): Promise<Message> {
    // Check if both users are participants in the volunteer event
    await this.validateParticipants(senderId, receiverId, volunteerId);

    return this.messageRepository.create(content, senderId, receiverId, volunteerId);
  }

  async getConversation(
    volunteerId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<Message[]> {
    // Check if user is participant in the volunteer event
    await this.validateUserParticipation(userId, volunteerId);

    return this.messageRepository.findConversationByVolunteerId(
      volunteerId,
      userId,
      page,
      limit
    );
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<Message> {
    // Check if user is participant in this conversation
    const isParticipant = await this.messageRepository.isUserParticipantInConversation(
      messageId,
      userId
    );

    if (!isParticipant) {
      throw new Error('Unauthorized: You cannot access this message');
    }

    const message = await this.messageRepository.markAsRead(messageId, userId);
    
    if (!message) {
      throw new Error('Message not found or you are not authorized to mark it as read');
    }

    return message;
  }

  private async validateParticipants(
    senderId: string,
    receiverId: string,
    volunteerId: string
  ): Promise<void> {
    const senderParticipation = await this.prisma.userVolunteer.findFirst({
      where: {
        userId: senderId,
        volunteerId: volunteerId,
      },
    });

    const receiverParticipation = await this.prisma.userVolunteer.findFirst({
      where: {
        userId: receiverId,
        volunteerId: volunteerId,
      },
    });

    if (!senderParticipation) {
      throw new Error('Sender is not a participant in this volunteer event');
    }

    if (!receiverParticipation) {
      throw new Error('Receiver is not a participant in this volunteer event');
    }
  }

  private async validateUserParticipation(
    userId: string,
    volunteerId: string
  ): Promise<void> {
    const participation = await this.prisma.userVolunteer.findFirst({
      where: {
        userId: userId,
        volunteerId: volunteerId,
      },
    });

    if (!participation) {
      throw new Error('User is not a participant in this volunteer event');
    }
  }
}