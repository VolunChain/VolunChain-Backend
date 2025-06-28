import { Request, Response } from "express";
import ProjectService from "../modules/project/application/services/ProjectService";

class ProjectController {
  private projectService = new ProjectService();

  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        description,
        location,
        startDate,
        endDate,
        organizationId,
      } = req.body;
      const project = await this.projectService.createProject({
        name,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        organizationId,
      });
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);
      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      res.status(200).json(project);
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async getProjectsByOrganizationId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { organizationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const { projects, total } =
        await this.projectService.getProjectsByOrganizationId(
          organizationId,
          page,
          pageSize
        );

      res.status(200).json({
        data: projects,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
}

export default ProjectController;
