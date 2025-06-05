import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @IsUUID()
  @IsNotEmpty()
  volunteerId: string;
}

export class MarkAsReadDto {
  @IsUUID()
  @IsNotEmpty()
  messageId: string;
}

export class MessageResponseDto {
  id: string;
  content: string;
  sentAt: Date;
  readAt: Date | null;
  senderId: string;
  receiverId: string;
  volunteerId: string;
}