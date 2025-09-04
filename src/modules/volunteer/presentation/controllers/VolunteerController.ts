import { Request, Response } from "express";

/**
 * Stub controller for Volunteer functionality
 * This replaces the original controller that referenced deleted services
 * TODO: Implement proper volunteer controller using new modular architecture
 */
export default class VolunteerController {
  async createVolunteer(req: Request, res: Response) {
    res.status(501).json({
      message: "Volunteer service temporarily disabled during migration",
      error: "Service migration in progress",
    });
  }

  async getVolunteerById(req: Request, res: Response) {
    res.status(501).json({
      message: "Volunteer service temporarily disabled during migration",
      error: "Service migration in progress",
    });
  }

  async getVolunteersByProjectId(req: Request, res: Response) {
    res.status(501).json({
      message: "Volunteer service temporarily disabled during migration",
      error: "Service migration in progress",
    });
  }

  async updateVolunteer(req: Request, res: Response) {
    res.status(501).json({
      message: "Volunteer service temporarily disabled during migration",
      error: "Service migration in progress",
    });
  }

  async deleteVolunteer(req: Request, res: Response) {
    res.status(501).json({
      message: "Volunteer service temporarily disabled during migration",
      error: "Service migration in progress",
    });
  }
}
