import { Request, Response } from 'express';
import { MessagingService } from '../services/MessagingService';
import { SendMessageDto, MessageResponseDto } from '../dto/message.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const sendMessageDto = plainToClass(SendMessageDto, req.body);
      const errors = await validate(sendMessageDto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.map(error => ({
            field: error.property,
            constraints: error.constraints
          }))
        });
        return;
      }

      const senderId = req.user?.id;
      if (!senderId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const message = await this.messagingService.sendMessage(
        sendMessageDto.content,
        senderId,
        sendMessageDto.receiverId,
        sendMessageDto.volunteerId
      );

      const response: MessageResponseDto = {
        id: message.id,
        content: message.content,
        sentAt: message.sentAt,
        readAt: message.readAt,
        senderId: message.senderId,
        receiverId: message.receiverId,
        volunteerId: message.volunteerId,
      };

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: response
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send message'
      });
    }
  }

  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const { volunteerId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!volunteerId) {
        res.status(400).json({
          success: false,
          message: 'Volunteer ID is required'
        });
        return;
      }

      const messages = await this.messagingService.getConversation(
        volunteerId,
        userId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        message: 'Conversation retrieved successfully',
        data: messages,
        pagination: {
          page,
          limit,
          total: messages.length
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve conversation'
      });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id: messageId } = req.params;

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!messageId) {
        res.status(400).json({
          success: false,
          message: 'Message ID is required'
        });
        return;
      }

      const message = await this.messagingService.markMessageAsRead(messageId, userId);

      res.status(200).json({
        success: true,
        message: 'Message marked as read',
        data: {
          id: message.id,
          readAt: message.readAt
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark message as read'
      });
    }
  }
}