import { UpdateProjectUseCase } from "../../use-cases/UpdateProjectUseCase";
import { IProjectRepository } from "../../repositories/IProjectRepository";
import { UpdateProjectDto } from "../../dto/UpdateProjectDto";
import { Project, ProjectStatus } from "../../domain/Project";
import { NotFoundException, ValidationException, InternalServerException } from "../../../../shared/exceptions/DomainExceptions";

describe("UpdateProjectUseCase", () => {
  let useCase: UpdateProjectUseCase;
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
    useCase = new UpdateProjectUseCase(mockRepository);
  });

  describe("execute", () => {
    it("should update and return project with valid data", async () => {
      const projectId = "project-123";
      const dto = new UpdateProjectDto();
      dto.title = "Updated Project";
      dto.description = "Updated Description";

      const existingProject = Project.create({
        title: "Original Project",
        description: "Original Description",
        organizationId: "org-123",
        status: ProjectStatus.DRAFT,
      });

      const updatedProject = Project.create({
        title: dto.title!,
        description: dto.description!,
        organizationId: "org-123",
        status: ProjectStatus.DRAFT,
      });

      mockRepository.findById.mockResolvedValue(existingProject);
      mockRepository.update.mockResolvedValue(updatedProject);

      const result = await useCase.execute(projectId, dto);

      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toEqual(updatedProject);
    });

    it("should throw NotFoundException when project not found", async () => {
      const projectId = "non-existent";
      const dto = new UpdateProjectDto();
      dto.title = "Updated Title";

      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(projectId, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ValidationException for invalid title", async () => {
      const projectId = "project-123";
      const dto = new UpdateProjectDto();
      dto.title = "ab"; // Too short

      const existingProject = Project.create({
        title: "Original Project",
        description: "Original Description",
        organizationId: "org-123",
        status: ProjectStatus.DRAFT,
      });

      mockRepository.findById.mockResolvedValue(existingProject);

      await expect(useCase.execute(projectId, dto)).rejects.toThrow(ValidationException);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ValidationException for invalid description", async () => {
      const projectId = "project-123";
      const dto = new UpdateProjectDto();
      dto.description = "short"; // Too short

      const existingProject = Project.create({
        title: "Original Project",
        description: "Original Description",
        organizationId: "org-123",
        status: ProjectStatus.DRAFT,
      });

      mockRepository.findById.mockResolvedValue(existingProject);

      await expect(useCase.execute(projectId, dto)).rejects.toThrow(ValidationException);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw InternalServerException when repository findById fails", async () => {
      const projectId = "project-123";
      const dto = new UpdateProjectDto();
      dto.title = "Updated Title";

      mockRepository.findById.mockRejectedValue(new Error("Database error"));

      await expect(useCase.execute(projectId, dto)).rejects.toThrow(InternalServerException);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw InternalServerException when repository update fails", async () => {
      const projectId = "project-123";
      const dto = new UpdateProjectDto();
      dto.title = "Updated Title";

      const existingProject = Project.create({
        title: "Original Project",
        description: "Original Description",
        organizationId: "org-123",
        status: ProjectStatus.DRAFT,
      });

      mockRepository.findById.mockResolvedValue(existingProject);
      mockRepository.update.mockRejectedValue(new Error("Update failed"));

      await expect(useCase.execute(projectId, dto)).rejects.toThrow(InternalServerException);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });
});
