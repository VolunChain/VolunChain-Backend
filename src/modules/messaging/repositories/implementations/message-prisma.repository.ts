import { PrismaClient } from "@prisma/client";
import { IMessageRepository } from "../interfaces/message-repository.interface";
import { Message } from "../../domain/entities/message.entity";

export class MessagePrismaRepository implements IMessageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(
    content: string,
    senderId: string,
    receiverId: string,
    volunteerId: string
  ): Promise<Message> {
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        volunteerId,
      },
    });

    return new Message(
      message.id,
      message.content,
      message.sentAt,
      message.readAt,
      message.senderId,
      message.receiverId,
      message.volunteerId
    );
  }

  async findConversationByVolunteerId(
    volunteerId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<Message[]> {
    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: {
        volunteerId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: {
        sentAt: "asc",
      },
      skip,
      take: limit,
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

    return messages.map(
      (msg: any) =>
        new Message(
          msg.id,
          msg.content,
          msg.sentAt,
          msg.readAt,
          msg.senderId,
          msg.receiverId,
          msg.volunteerId
        )
    );
  }

  async markAsRead(messageId: string, userId: string): Promise<Message | null> {
    // First check if user is the receiver of this message
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        receiverId: userId,
      },
    });

    if (!message) {
      return null;
    }

    const updatedMessage = await this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        readAt: new Date(),
      },
    });

    return new Message(
      updatedMessage.id,
      updatedMessage.content,
      updatedMessage.sentAt,
      updatedMessage.readAt,
      updatedMessage.senderId,
      updatedMessage.receiverId,
      updatedMessage.volunteerId
    );
  }

  async findById(messageId: string): Promise<Message | null> {
    const message = await this.prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return null;
    }

    return new Message(
      message.id,
      message.content,
      message.sentAt,
      message.readAt,
      message.senderId,
      message.receiverId,
      message.volunteerId
    );
  }

  async isUserParticipantInConversation(
    messageId: string,
    userId: string
  ): Promise<boolean> {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    return message !== null;
  }
}
