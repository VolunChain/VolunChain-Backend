import { prisma } from "../../../../config/prisma";
import { Project } from "../../../../entities/Project";
import { Volunteer } from "../../../../entities/Volunteer";
import { withTransaction } from "../../../../utils/transaction.helper";
import { Logger } from "../../../../utils/logger";
import {
  ValidationError,
  DatabaseError,
} from "../../../../modules/shared/application/errors";

// Define types based on the Prisma schema
interface PrismaProject {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizationId: string;
  volunteers: PrismaVolunteer[];
}

interface PrismaVolunteer {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  requirements: string;
  incentive: string | null;
  projectId: string;
  project: {
    id: string;
    name: string;
    description: string;
    location: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    organizationId: string;
  };
}

interface CreateProjectData {
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizationId: string;
  initialVolunteers?: Array<{
    name: string;
    description: string;
    requirements: string;
    incentive?: string;
  }>;
}

interface UpdateProjectData {
  name?: string;
  description?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
}

class ProjectService {
  private projectRepo = prisma.project;
  private logger = new Logger("ProjectService");

  /**
   * Create a new project with optional initial volunteers
   * Uses transaction to ensure data consistency
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      this.validateProjectData(data);

      return await withTransaction(async (tx) => {
        this.logger.info("Creating project with transaction", {
          projectName: data.name,
          organizationId: data.organizationId,
        });

        // Create the project
        const project = await tx.project.create({
          data: {
            name: data.name,
            description: data.description,
            location: data.location,
            startDate: data.startDate,
            endDate: data.endDate,
            organizationId: data.organizationId,
          },
          include: {
            volunteers: {
              include: {
                project: true,
              },
            },
          },
        });

        // Create initial volunteers if provided
        if (data.initialVolunteers && data.initialVolunteers.length > 0) {
          const volunteersData = data.initialVolunteers.map((volunteer) => ({
            ...volunteer,
            projectId: project.id,
          }));

          await tx.volunteer.createMany({
            data: volunteersData,
          });

          // Fetch the project with volunteers
          const projectWithVolunteers = await tx.project.findUnique({
            where: { id: project.id },
            include: {
              volunteers: {
                include: {
                  project: true,
                },
              },
            },
          });

          if (!projectWithVolunteers) {
            throw new DatabaseError(
              "Failed to fetch created project with volunteers"
            );
          }

          return this.mapToProject(projectWithVolunteers);
        }

        return this.mapToProject(project);
      });
    } catch (error) {
      this.logger.error("Failed to create project", {
        error: error instanceof Error ? error.message : "Unknown error",
        projectData: data,
      });

      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }

      throw new DatabaseError("Failed to create project", {
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async createProjectLegacy(
    name: string,
    description: string,
    location: string,
    startDate: Date,
    endDate: Date,
    organizationId: string
  ): Promise<Project> {
    return this.createProject({
      name,
      description,
      location,
      startDate,
      endDate,
      organizationId,
    });
  }

  /**
   * Update project with transaction support
   */
  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    try {
      return await withTransaction(async (tx) => {
        this.logger.info("Updating project with transaction", {
          projectId: id,
        });

        // Check if project exists
        const existingProject = await tx.project.findUnique({
          where: { id },
        });

        if (!existingProject) {
          throw new ValidationError("Project not found", { projectId: id });
        }

        // Update the project
        const updatedProject = await tx.project.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date(),
          },
          include: {
            volunteers: {
              include: {
                project: true,
              },
            },
          },
        });

        return this.mapToProject(updatedProject);
      });
    } catch (error) {
      this.logger.error("Failed to update project", {
        error: error instanceof Error ? error.message : "Unknown error",
        projectId: id,
        updateData: data,
      });

      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }

      throw new DatabaseError("Failed to update project", {
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete project and all associated volunteers
   * Uses transaction to ensure data consistency
   */
  async deleteProject(id: string): Promise<void> {
    try {
      await withTransaction(async (tx) => {
        this.logger.info("Deleting project with transaction", {
          projectId: id,
        });

        // Check if project exists
        const existingProject = await tx.project.findUnique({
          where: { id },
          include: {
            volunteers: true,
          },
        });

        if (!existingProject) {
          throw new ValidationError("Project not found", { projectId: id });
        }

        // Delete all volunteers first (due to foreign key constraints)
        if (existingProject.volunteers.length > 0) {
          await tx.volunteer.deleteMany({
            where: { projectId: id },
          });

          this.logger.info("Deleted associated volunteers", {
            projectId: id,
            volunteerCount: existingProject.volunteers.length,
          });
        }

        // Delete the project
        await tx.project.delete({
          where: { id },
        });

        this.logger.info("Project deleted successfully", { projectId: id });
      });
    } catch (error) {
      this.logger.error("Failed to delete project", {
        error: error instanceof Error ? error.message : "Unknown error",
        projectId: id,
      });

      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }

      throw new DatabaseError("Failed to delete project", {
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Add multiple volunteers to a project atomically
   */
  async addVolunteersToProject(
    projectId: string,
    volunteers: Array<{
      name: string;
      description: string;
      requirements: string;
      incentive?: string;
    }>
  ): Promise<Volunteer[]> {
    try {
      return await withTransaction(async (tx) => {
        this.logger.info("Adding volunteers to project with transaction", {
          projectId,
          volunteerCount: volunteers.length,
        });

        // Verify project exists
        const project = await tx.project.findUnique({
          where: { id: projectId },
        });

        if (!project) {
          throw new ValidationError("Project not found", { projectId });
        }

        // Create volunteers
        const volunteersData = volunteers.map((volunteer) => ({
          ...volunteer,
          projectId,
        }));

        await tx.volunteer.createMany({
          data: volunteersData,
        });

        // Fetch created volunteers
        const createdVolunteers = await tx.volunteer.findMany({
          where: {
            projectId,
            name: { in: volunteers.map((v) => v.name) },
          },
          include: {
            project: true,
          },
        });

        return createdVolunteers.map((v) => this.mapToVolunteer(v, project));
      });
    } catch (error) {
      this.logger.error("Failed to add volunteers to project", {
        error: error instanceof Error ? error.message : "Unknown error",
        projectId,
        volunteers,
      });

      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }

      throw new DatabaseError("Failed to add volunteers to project", {
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getProjectById(id: string): Promise<Project | null> {
    try {
      const project = await this.projectRepo.findUnique({
        where: { id },
        include: {
          volunteers: {
            include: {
              project: true,
            },
          },
        },
      });
      return project ? this.mapToProject(project) : null;
    } catch (error) {
      this.logger.error("Failed to get project by id", {
        error: error instanceof Error ? error.message : "Unknown error",
        projectId: id,
      });
      throw new DatabaseError("Failed to fetch project", {
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getProjectsByOrganizationId(
    organizationId: string,
    page = 1,
    pageSize = 10
  ): Promise<{ projects: Project[]; total: number }> {
    try {
      const skip = (page - 1) * pageSize;

      const [projects, total] = await Promise.all([
        this.projectRepo.findMany({
          where: {
            organizationId,
          },
          skip,
          take: pageSize,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            volunteers: {
              include: {
                project: true,
              },
            },
          },
        }),
        this.projectRepo.count({
          where: {
            organizationId,
          },
        }),
      ]);

      return {
        projects: projects.map((project: PrismaProject) =>
          this.mapToProject(project)
        ),
        total,
      };
    } catch (error) {
      this.logger.error("Failed to get projects by organization", {
        error: error instanceof Error ? error.message : "Unknown error",
        organizationId,
        page,
        pageSize,
      });
      throw new DatabaseError("Failed to fetch projects", {
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Validate project data
   */
  private validateProjectData(data: CreateProjectData): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Project name is required");
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new ValidationError("Project description is required");
    }

    if (!data.location || data.location.trim().length === 0) {
      throw new ValidationError("Project location is required");
    }

    if (!data.organizationId || data.organizationId.trim().length === 0) {
      throw new ValidationError("Organization ID is required");
    }

    if (data.startDate >= data.endDate) {
      throw new ValidationError("Start date must be before end date");
    }

    if (data.startDate < new Date()) {
      throw new ValidationError("Start date cannot be in the past");
    }
  }

  private mapToProject(prismaProject: PrismaProject): Project {
    const project = new Project();
    project.id = prismaProject.id;
    project.name = prismaProject.name;
    project.description = prismaProject.description;
    project.location = prismaProject.location;
    project.startDate = prismaProject.startDate;
    project.endDate = prismaProject.endDate;
    project.createdAt = prismaProject.createdAt;
    project.updatedAt = prismaProject.updatedAt;

    project.volunteers = prismaProject.volunteers.map((v: PrismaVolunteer) =>
      this.mapToVolunteer(v, project)
    );

    return project;
  }

  private mapToVolunteer(
    prismaVolunteer: PrismaVolunteer,
    project: Project
  ): Volunteer {
    const volunteer = new Volunteer();
    volunteer.id = prismaVolunteer.id;
    volunteer.name = prismaVolunteer.name;
    volunteer.description = prismaVolunteer.description;
    volunteer.requirements = prismaVolunteer.requirements;
    volunteer.incentive = prismaVolunteer.incentive || undefined;
    volunteer.project = project;
    volunteer.createdAt = prismaVolunteer.createdAt;
    volunteer.updatedAt = prismaVolunteer.updatedAt;
    return volunteer;
  }
}

export default ProjectService;
