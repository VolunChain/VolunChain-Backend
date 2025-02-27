import { prisma } from '../config/prisma';
import { Project } from '../entities/Project';
// import { Equal } from 'prisma'; // Commented out until its usage is confirmed

class ProjectService {
  private projectRepo = prisma.project;

  async createProject(
    name: string,
    description: string,
    location: string,
    startDate: Date,
    endDate: Date,
    organizationId: string
  ): Promise<Project> {
    const project = await this.projectRepo.create({
      data: {
        name,
        description,
        location,
        startDate,
        endDate,
        // organization: { id: organizationId }, // Commented out because it depends on the Organization entity
      },
    });
    return project;
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projectRepo.findUnique({
      where: { id }, // Removed Equal to simplify for now
      // relations: ['organization'], // Commented out because it depends on the Organization entity
    });
  }

  async getProjectsByOrganizationId(organizationId: string): Promise<Project[]> {
    return this.projectRepo.findMany({
      // where: { organization: { id: organizationId } }, // Commented out because it depends on the Organization entity
    });
  }
}

export default ProjectService;
