import { PrismaClient } from '@prisma/client';
import { IProjectRepository } from './IProjectRepository';
import { Project, ProjectStatus } from '../domain/Project';
import { InternalServerException } from '../../../shared/exceptions/DomainExceptions';

export class PrismaProjectRepository implements IProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Project | null> {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id }
      });

      if (!project) return null;

      return Project.create({
        title: project.title,
        description: project.description,
        organizationId: project.organizationId,
        status: project.status as ProjectStatus
      });
    } catch (error) {
      throw new InternalServerException(`Failed to find project with id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Project[]> {
    try {
      const projects = await this.prisma.project.findMany();
      return projects.map(project =>
        Project.create({
          title: project.title,
          description: project.description,
          organizationId: project.organizationId,
          status: project.status as ProjectStatus
        })
      );
    } catch (error) {
      throw new InternalServerException(`Failed to find all projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByOrganizationId(organizationId: string): Promise<Project[]> {
    try {
      const projects = await this.prisma.project.findMany({
        where: { organizationId }
      });
      return projects.map(project =>
        Project.create({
          title: project.title,
          description: project.description,
          organizationId: project.organizationId,
          status: project.status as ProjectStatus
        })
      );
    } catch (error) {
      throw new InternalServerException(`Failed to find projects for organization ${organizationId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async save(project: Project): Promise<Project> {
    try {
      const savedProject = await this.prisma.project.create({
        data: {
          id: project.id,
          title: project.title,
          description: project.description,
          organizationId: project.organizationId,
          status: project.status,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return Project.create({
        title: savedProject.title,
        description: savedProject.description,
        organizationId: savedProject.organizationId,
        status: savedProject.status as ProjectStatus
      });
    } catch (error) {
      throw new InternalServerException(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(project: Project): Promise<Project> {
    try {
      const updatedProject = await this.prisma.project.update({
        where: { id: project.id },
        data: {
          title: project.title,
          description: project.description,
          organizationId: project.organizationId,
          status: project.status,
          updatedAt: new Date()
        }
      });

      return Project.create({
        title: updatedProject.title,
        description: updatedProject.description,
        organizationId: updatedProject.organizationId,
        status: updatedProject.status as ProjectStatus
      });
    } catch (error) {
      throw new InternalServerException(`Failed to update project ${project.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.project.delete({
        where: { id }
      });
    } catch (error) {
      throw new InternalServerException(`Failed to delete project ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
