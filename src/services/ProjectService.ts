import { prisma } from "../config/prisma";
import { Project } from "../entities/Project";
import { Volunteer } from "../entities/Volunteer";
import { Prisma } from "@prisma/client";
// import { Equal } from 'typeorm'; // Commented out until its usage is confirmed

type PrismaProjectWithVolunteers = Prisma.ProjectGetPayload<{
  include: {
    volunteers: {
      include: {
        project: true;
      };
    };
  };
}>;

type PrismaVolunteer = Prisma.VolunteerGetPayload<{
  include: {
    project: true;
  };
}>;

class ProjectService {
  private projectRepo = prisma.project;

  async createProject(
    name: string,
    description: string,
    location: string,
    startDate: Date,
    endDate: Date
  ): Promise<Project> {
    const project = await this.projectRepo.create({
      data: {
        name,
        description,
        location,
        startDate,
        endDate,
        volunteers: {
          create: [], // Initialize with empty volunteers array
        },
      },
      include: {
        volunteers: {
          include: {
            project: true,
          },
        },
      },
    });
    return this.mapToProject(project);
  }

  async getProjectById(id: string): Promise<Project | null> {
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
  }

  async getProjectsByOrganizationId(
    organizationId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ projects: Project[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const [projects, total] = await Promise.all([
      this.projectRepo.findMany({
        where: {
          // organization: { id: organizationId } // Commented out because it depends on the Organization entity
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
          // organization: { id: organizationId } // Commented out because it depends on the Organization entity
        },
      }),
    ]);

    return {
      projects: projects.map((project) => this.mapToProject(project)),
      total,
    };
  }

  private mapToProject(prismaProject: PrismaProjectWithVolunteers): Project {
    const project = new Project();
    project.id = prismaProject.id;
    project.name = prismaProject.name;
    project.description = prismaProject.description;
    project.location = prismaProject.location;
    project.startDate = prismaProject.startDate;
    project.endDate = prismaProject.endDate;
    project.createdAt = prismaProject.createdAt;
    project.updatedAt = prismaProject.updatedAt;

    project.volunteers = prismaProject.volunteers.map((v: PrismaVolunteer) => {
      const volunteer = new Volunteer();
      volunteer.id = v.id;
      volunteer.name = v.name;
      volunteer.description = v.description;
      volunteer.requirements = v.requirements;
      volunteer.incentive = v.incentive || undefined; // Convert null to undefined
      volunteer.project = project;
      volunteer.createdAt = v.createdAt;
      volunteer.updatedAt = v.updatedAt;
      return volunteer;
    });

    return project;
  }
}

export default ProjectService;
