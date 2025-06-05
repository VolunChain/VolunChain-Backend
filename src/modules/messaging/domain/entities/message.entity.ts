export class Message {
  id: string;
  content: string;
  sentAt: Date;
  readAt: Date | null;
  senderId: string;
  receiverId: string;
  volunteerId: string;

  constructor(
    id: string,
    content: string,
    sentAt: Date,
    readAt: Date | null,
    senderId: string,
    receiverId: string,
    volunteerId: string
  ) {
    this.id = id;
    this.content = content;
    this.sentAt = sentAt;
    this.readAt = readAt;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.volunteerId = volunteerId;
  }

  markAsRead(): void {
    this.readAt = new Date();
  }

  isRead(): boolean {
    return this.readAt !== null;
  }
}