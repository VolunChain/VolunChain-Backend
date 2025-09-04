import { DeleteProjectUseCase } from "../../use-cases/DeleteProjectUseCase";
import { IProjectRepository } from "../../repositories/IProjectRepository";
import { Project, ProjectStatus } from "../../domain/Project";
import { NotFoundException, InternalServerException } from "../../../../shared/exceptions/DomainExceptions";

describe("DeleteProjectUseCase", () => {
  let useCase: DeleteProjectUseCase;
  let mockRepository: jest.Mocked<IProjectRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByOrganizationId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteProjectUseCase(mockRepository);
  });

  describe("execute", () => {
    it("should delete project when found", async () => {
      const projectId = "project-123";
      const mockProject = Project.create({
        title: "Test Project",
        description: "Test Description",
        organizationId: "org-123",
        status: ProjectStatus.DRAFT,
      });

      mockRepository.findById.mockResolvedValue(mockProject);
      mockRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(projectId);

      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockRepository.delete).toHaveBeenCalledWith(projectId);
    });

    it("should throw NotFoundException when project not found", async () => {
      const projectId = "non-existent";
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(projectId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw InternalServerException when repository findById fails", async () => {
      const projectId = "project-123";
      mockRepository.findById.mockRejectedValue(new Error("Database error"));

      await expect(useCase.execute(projectId)).rejects.toThrow(InternalServerException);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw InternalServerException when repository delete fails", async () => {
      const projectId = "project-123";
      const mockProject = Project.create({
        title: "Test Project",
        description: "Test Description",
        organizationId: "org-123",
        status: ProjectStatus.DRAFT,
      });

      mockRepository.findById.mockResolvedValue(mockProject);
      mockRepository.delete.mockRejectedValue(new Error("Delete failed"));

      await expect(useCase.execute(projectId)).rejects.toThrow(InternalServerException);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockRepository.delete).toHaveBeenCalledWith(projectId);
    });
  });
});
