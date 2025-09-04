import { PrismaClient } from "@prisma/client";
import { IProjectRepository } from "../application/repositories/IProjectRepository";
import {
  IProjectProps,
  ProjectEntity,
} from "../domain/entities/project.entity";

export class ProjectRepository implements IProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<ProjectEntity | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) return null;

    return ProjectEntity.create(
      project.id,
      project.name,
      project.description,
      project.organizationId,
      project.startDate,
      project.endDate,
      project.organizationId,
      project.status,
      project.volunteers
    );
  }

  async findAll(): Promise<ProjectEntity[]> {
    const projects = await this.prisma.project.findMany();
    return projects.map((project: IProjectProps) =>
      ProjectEntity.create(
        project.id,
        project.name,
        project.description,
        project.organizationId,
        project.startDate,
        project.endDate,
        project.organizationId,
        project.status,
        project.volunteers
      )
    );
  }

  async findByOrganizationId(organizationId: string): Promise<ProjectEntity[]> {
    const projects = await this.prisma.project.findMany({
      where: { organizationId },
    });
    return projects.map((project: IProjectProps) =>
      ProjectEntity.create(
        project.id,
        project.name,
        project.description,
        project.organizationId,
        project.startDate,
        project.endDate,
        project.organizationId,
        project.status,
        project.volunteers
      )
    );
  }

  async save(project: ProjectEntity): Promise<ProjectEntity> {
    await this.prisma.project.create({
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        organizationId: project.organizationId,
        status: project.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return ProjectEntity.create(
      project.id,
      project.name,
      project.description,
      project.organizationId,
      project.startDate,
      project.endDate,
      project.organizationId,
      project.status,
      project.volunteers
    );
  }

  async update(project: ProjectEntity): Promise<ProjectEntity> {
    const updatedProject = await this.prisma.project.update({
      where: { id: project.id },
      data: {
        name: project.name, // mapeo correcto
        description: project.description,
        organizationId: project.organizationId,
        status: project.status,
        // ojo con volunteers: depende de tu modelo Prisma
        updatedAt: new Date(),
      },
      include: {
        volunteers: true, // para traer la relación
      },
    });

    return ProjectEntity.create(
      updatedProject.id,
      updatedProject.name, // title
      updatedProject.description,
      updatedProject.organizationId,
      updatedProject.status,
      updatedProject.startDate,
      updatedProject.endDate,
      updatedProject.volunteers
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({
      where: { id },
    });
  }
}
