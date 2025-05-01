import { Request, Response, RequestHandler } from "express";
import { prisma } from "../config/prisma";

export const sendMessage: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content, senderId, receiverId, volunteerId } = req.body;

    if (!senderId || !receiverId || !volunteerId) {
      res
        .status(400)
        .json({ error: "senderId, receiverId, and volunteerId are required" });
      return;
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        volunteerId,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessagesForVolunteer: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { volunteerId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { volunteerId },
      orderBy: { sentAt: "desc" },
      include: {
        sender: true,
        receiver: true,
      },
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessageAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
