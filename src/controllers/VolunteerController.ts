import { Request, Response } from "express";
import VolunteerService from "../services/VolunteerService";
import { CreateVolunteerDto, GetVolunteerByIdDto, GetVolunteersByProjectDto } from "../modules/volunteer/dto/volunteer.dto";
import { validateDto } from "../middleware/validation.middleware";

class VolunteerController {
  private volunteerService = new VolunteerService();

  async createVolunteer(req: Request, res: Response): Promise<void> {
    try {
      const volunteerData: CreateVolunteerDto = req.body;
      const volunteer =
        await this.volunteerService.createVolunteer(volunteerData);
      res.status(201).json(volunteer);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async getVolunteerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const volunteer = await this.volunteerService.getVolunteerById(id);
      if (!volunteer) {
        res.status(404).json({ error: "Volunteer not found" });
        return;
      }
      res.status(200).json(volunteer);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async getVolunteersByProjectId(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const volunteers =
        await this.volunteerService.getVolunteersByProjectId(projectId);
      res.status(200).json(volunteers);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
}

const volunteerController = new VolunteerController();

export default {
  createVolunteer: [validateDto(CreateVolunteerDto), volunteerController.createVolunteer.bind(volunteerController)],
  getVolunteerById: [validateDto(GetVolunteerByIdDto), volunteerController.getVolunteerById.bind(volunteerController)],
  getVolunteersByProjectId: [validateDto(GetVolunteersByProjectDto), volunteerController.getVolunteersByProjectId.bind(volunteerController)]
};
