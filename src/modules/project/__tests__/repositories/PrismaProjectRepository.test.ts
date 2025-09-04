import { PrismaProjectRepository } from "../../repositories/PrismaProjectRepository";
import { PrismaClient } from "@prisma/client";
import { Project, ProjectStatus } from "../../domain/Project";
import { InternalServerException } from "../../../../shared/exceptions/DomainExceptions";

describe("PrismaProjectRepository", () => {
  let repository: PrismaProjectRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      project: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    repository = new PrismaProjectRepository(mockPrisma);
  });

  describe("findById", () => {
    it("should return project when found", async () => {
      const projectId = "project-123";
      const mockPrismaProject = {
        id: projectId,
        title: "Test Project",
        description: "Test Description",
        organizationId: "org-123",
        status: ProjectStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockPrismaProject);

      const result = await repository.findById(projectId);

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId }
      });
      expect(result).toBeInstanceOf(Project);
      expect(result?.title).toBe("Test Project");
    });

    it("should return null when project not found", async () => {
      const projectId = "non-existent";
      mockPrisma.project.findUnique.mockResolvedValue(null);

      const result = await repository.findById(projectId);

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId }
      });
      expect(result).toBeNull();
    });

    it("should throw InternalServerException when database error occurs", async () => {
      const projectId = "project-123";
      mockPrisma.project.findUnique.mockRejectedValue(new Error("Database connection failed"));

      await expect(repository.findById(projectId)).rejects.toThrow(InternalServerException);
      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId }
      });
    });
  });

  describe("save", () => {
    it("should save and return project", async () => {
      const project = Project.create({
        title: "Test Project",
        description: "Test Description",
        organizationId: "org-123",
        status: ProjectStatus.DRAFT,
      });

      const mockSavedProject = {
        id: project.id,
        title: project.title,
        description: project.description,
        organizationId: project.organizationId,
        status: project.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.project.create.mockResolvedValue(mockSavedProject);

      const result = await repository.save(project);

      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: {
          id: project.id,
          title: project.title,
          description: project.description,
          organizationId: project.organizationId,
          status: project.status,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }
      });
      expect(result).toBeInstanceOf(Project);
    });

    it("should throw InternalServerException when save fails", async () => {
      const project = Project.create({
        title: "Test Project",
        description: "Test Description",
        organizationId: "org-123",
        status: ProjectStatus.DRAFT,
      });

      mockPrisma.project.create.mockRejectedValue(new Error("Save failed"));

      await expect(repository.save(project)).rejects.toThrow(InternalServerException);
    });
  });

  describe("update", () => {
    it("should update and return project", async () => {
      const project = Project.create({
        title: "Updated Project",
        description: "Updated Description",
        organizationId: "org-123",
        status: ProjectStatus.ACTIVE,
      });

      const mockUpdatedProject = {
        id: project.id,
        title: project.title,
        description: project.description,
        organizationId: project.organizationId,
        status: project.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.project.update.mockResolvedValue(mockUpdatedProject);

      const result = await repository.update(project);

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: project.id },
        data: {
          title: project.title,
          description: project.description,
          organizationId: project.organizationId,
          status: project.status,
          updatedAt: expect.any(Date),
        }
      });
      expect(result).toBeInstanceOf(Project);
    });

    it("should throw InternalServerException when update fails", async () => {
      const project = Project.create({
        title: "Updated Project",
        description: "Updated Description",
        organizationId: "org-123",
        status: ProjectStatus.ACTIVE,
      });

      mockPrisma.project.update.mockRejectedValue(new Error("Update failed"));

      await expect(repository.update(project)).rejects.toThrow(InternalServerException);
    });
  });

  describe("delete", () => {
    it("should delete project", async () => {
      const projectId = "project-123";
      mockPrisma.project.delete.mockResolvedValue({} as any);

      await repository.delete(projectId);

      expect(mockPrisma.project.delete).toHaveBeenCalledWith({
        where: { id: projectId }
      });
    });

    it("should throw InternalServerException when delete fails", async () => {
      const projectId = "project-123";
      mockPrisma.project.delete.mockRejectedValue(new Error("Delete failed"));

      await expect(repository.delete(projectId)).rejects.toThrow(InternalServerException);
    });
  });

  describe("findAll", () => {
    it("should return all projects", async () => {
      const mockProjects = [
        {
          id: "project-1",
          title: "Project 1",
          description: "Description 1",
          organizationId: "org-123",
          status: ProjectStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "project-2",
          title: "Project 2",
          description: "Description 2",
          organizationId: "org-123",
          status: ProjectStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await repository.findAll();

      expect(mockPrisma.project.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Project);
      expect(result[1]).toBeInstanceOf(Project);
    });

    it("should throw InternalServerException when findMany fails", async () => {
      mockPrisma.project.findMany.mockRejectedValue(new Error("Find failed"));

      await expect(repository.findAll()).rejects.toThrow(InternalServerException);
    });
  });

  describe("findByOrganizationId", () => {
    it("should return projects for organization", async () => {
      const organizationId = "org-123";
      const mockProjects = [
        {
          id: "project-1",
          title: "Project 1",
          description: "Description 1",
          organizationId,
          status: ProjectStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await repository.findByOrganizationId(organizationId);

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { organizationId }
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Project);
    });

    it("should throw InternalServerException when findByOrganizationId fails", async () => {
      const organizationId = "org-123";
      mockPrisma.project.findMany.mockRejectedValue(new Error("Find failed"));

      await expect(repository.findByOrganizationId(organizationId)).rejects.toThrow(InternalServerException);
    });
  });
});
