import { IsString, IsNotEmpty } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  volunteerId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class MessageDto {
  id: string;
  content: string;
  sentAt: Date;
  readAt: Date | null;
  read: boolean;
  senderId: string;
  receiverId: string;
  volunteerId: string;
}

export class UpdateReadStatusDto {}
