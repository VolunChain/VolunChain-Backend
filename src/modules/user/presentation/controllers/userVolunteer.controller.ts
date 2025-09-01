import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class UserVolunteerController {
  async addUserToVolunteer(req: Request, res: Response): Promise<Response> {
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
        return res.status(400).json({
          error: "User is already assigned to this volunteer",
        });
      }

      const userVolunteer = await prisma.userVolunteer.create({
        data: {
          userId,
          volunteerId,
        },
      });

      return res.status(201).json(userVolunteer);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getVolunteersByUserId(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      const userVolunteers = await prisma.userVolunteer.findMany({
        where: { userId },
        include: {
          volunteer: true,
        },
      });

      return res.status(200).json(userVolunteers);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getUsersByVolunteerId(req: Request, res: Response): Promise<Response> {
    try {
      const { volunteerId } = req.params;

      const userVolunteers = await prisma.userVolunteer.findMany({
        where: { volunteerId },
        include: {
          user: true,
        },
      });

      return res.status(200).json(userVolunteers);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async removeUserFromVolunteer(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId, volunteerId } = req.params;

      const deleted = await prisma.userVolunteer.deleteMany({
        where: {
          userId,
          volunteerId,
        },
      });

      if (deleted.count === 0) {
        return res.status(404).json({
          error: "User-Volunteer relationship not found",
        });
      }

      return res.status(200).json({
        message: "User removed from volunteer successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
