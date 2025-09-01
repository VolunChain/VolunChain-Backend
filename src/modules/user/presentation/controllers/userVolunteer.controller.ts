import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class UserVolunteerController {
  async addUserToVolunteer(req: Request, res: Response): Promise<void> {
    try {
      const { userId, volunteerId } = req.params;

      // Check if the relationship already exists
      const existing = await prisma.userVolunteer.findFirst({
        where: {
          userId,
          volunteerId,
        },
      });

      if (existing) {
        res.status(400).json({
          error: "User is already assigned to this volunteer",
        });
        return;
      }

      const userVolunteer = await prisma.userVolunteer.create({
        data: {
          userId,
          volunteerId,
        },
      });

      res.status(201).json(userVolunteer);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getVolunteersByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const userVolunteers = await prisma.userVolunteer.findMany({
        where: { userId },
        include: {
          volunteer: true,
        },
      });

      res.status(200).json(userVolunteers);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getUsersByVolunteerId(req: Request, res: Response): Promise<void> {
    try {
      const { volunteerId } = req.params;

      const userVolunteers = await prisma.userVolunteer.findMany({
        where: { volunteerId },
        include: {
          user: true,
        },
      });

      res.status(200).json(userVolunteers);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async removeUserFromVolunteer(req: Request, res: Response): Promise<void> {
    try {
      const { userId, volunteerId } = req.params;

      const deleted = await prisma.userVolunteer.deleteMany({
        where: {
          userId,
          volunteerId,
        },
      });

      if (deleted.count === 0) {
        res.status(404).json({
          error: "User-Volunteer relationship not found",
        });
        return;
      }

      res.status(200).json({
        message: "User removed from volunteer successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
