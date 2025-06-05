import { Message } from '../../domain/entities/message.entity';

export interface IMessageRepository {
  create(
    content: string,
    senderId: string,
    receiverId: string,
    volunteerId: string
  ): Promise<Message>;
  
  findConversationByVolunteerId(
    volunteerId: string,
    userId: string,
    page?: number,
    limit?: number
  ): Promise<Message[]>;
  
  markAsRead(messageId: string, userId: string): Promise<Message | null>;
  
  findById(messageId: string): Promise<Message | null>;
  
  isUserParticipantInConversation(
    messageId: string,
    userId: string
  ): Promise<boolean>;
}