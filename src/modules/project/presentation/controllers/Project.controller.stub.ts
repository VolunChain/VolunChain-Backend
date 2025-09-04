import { Request, Response } from "express";
import { CreateProjectUseCase } from "../../use-cases/CreateProjectUseCase";
import { GetProjectUseCase } from "../../use-cases/GetProjectUseCase";
import { ListProjectsUseCase } from "../../use-cases/ListProjectsUseCase";
import { UpdateProjectUseCase } from "../../use-cases/UpdateProjectUseCase";
import { DeleteProjectUseCase } from "../../use-cases/DeleteProjectUseCase";
import { CreateProjectDto } from "../../dto/CreateProjectDto";
import { UpdateProjectDto } from "../../dto/UpdateProjectDto";
import { AppException } from "../../../../shared/exceptions/AppException";

export default class ProjectController {
  constructor(
    private createProjectUseCase: CreateProjectUseCase,
    private getProjectUseCase: GetProjectUseCase,
    private listProjectsUseCase: ListProjectsUseCase,
    private updateProjectUseCase: UpdateProjectUseCase,
    private deleteProjectUseCase: DeleteProjectUseCase
  ) {}

  async createProject(req: Request, res: Response) {
    try {
      const createProjectDto = new CreateProjectDto();
      Object.assign(createProjectDto, req.body);

      const project = await this.createProjectUseCase.execute(createProjectDto);
      
      res.status(201).json({
        success: true,
        data: project
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw error;
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await this.getProjectUseCase.execute(id);
      
      res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw error;
    }
  }

  async getProjectsByOrganizationId(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const projects = await this.listProjectsUseCase.execute(organizationId);
      
      res.status(200).json({
        success: true,
        data: projects
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw error;
    }
  }

  async getAllProjects(req: Request, res: Response) {
    try {
      const projects = await this.listProjectsUseCase.execute();
      
      res.status(200).json({
        success: true,
        data: projects
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw error;
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateProjectDto = new UpdateProjectDto();
      Object.assign(updateProjectDto, req.body);

      const project = await this.updateProjectUseCase.execute(id, updateProjectDto);
      
      res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw error;
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.deleteProjectUseCase.execute(id);
      
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw error;
    }
  }
}