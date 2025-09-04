import { GetProjectUseCase } from "../../use-cases/GetProjectUseCase";
import { IProjectRepository } from "../../repositories/IProjectRepository";
import { Project, ProjectStatus } from "../../domain/Project";
import { NotFoundException, InternalServerException } from "../../../../shared/exceptions/DomainExceptions";

describe("GetProjectUseCase", () => {
  let useCase: GetProjectUseCase;
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
    useCase = new GetProjectUseCase(mockRepository);
  });

  describe("execute", () => {
    it("should return project when found", async () => {
      const projectId = "project-123";
      const mockProject = Project.create({
        title: "Test Project",
        description: "Test Description",
        organizationId: "org-123",
        status: ProjectStatus.DRAFT,
      });

      mockRepository.findById.mockResolvedValue(mockProject);

      const result = await useCase.execute(projectId);

      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(mockProject);
    });

    it("should throw NotFoundException when project not found", async () => {
      const projectId = "non-existent";
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(projectId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
    });

    it("should throw InternalServerException when repository fails", async () => {
      const projectId = "project-123";
      mockRepository.findById.mockRejectedValue(new Error("Database connection failed"));

      await expect(useCase.execute(projectId)).rejects.toThrow(InternalServerException);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
    });
  });
});
