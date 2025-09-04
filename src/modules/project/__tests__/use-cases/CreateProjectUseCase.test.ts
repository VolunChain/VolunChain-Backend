import { CreateProjectUseCase } from "../../use-cases/CreateProjectUseCase";
import { IProjectRepository } from "../../repositories/IProjectRepository";
import { CreateProjectDto } from "../../dto/CreateProjectDto";
import { Project, ProjectStatus } from "../../domain/Project";
import { ValidationException, InternalServerException } from "../../../../shared/exceptions/DomainExceptions";

describe("CreateProjectUseCase", () => {
  let useCase: CreateProjectUseCase;
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
    useCase = new CreateProjectUseCase(mockRepository);
  });

  describe("execute", () => {
    it("should create and save a project with valid data", async () => {
      const dto = new CreateProjectDto();
      dto.title = "Test Project";
      dto.description = "Test Description";
      dto.organizationId = "org-123";
      dto.status = ProjectStatus.DRAFT;

      const mockProject = Project.create({
        title: dto.title,
        description: dto.description,
        organizationId: dto.organizationId,
        status: dto.status,
      });

      mockRepository.save.mockResolvedValue(mockProject);

      const result = await useCase.execute(dto);

      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Project));
      expect(result).toEqual(mockProject);
    });

    it("should throw ValidationException for invalid title", async () => {
      const dto = new CreateProjectDto();
      dto.title = "ab"; // Too short
      dto.description = "Test Description";
      dto.organizationId = "org-123";

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should throw ValidationException for invalid description", async () => {
      const dto = new CreateProjectDto();
      dto.title = "Test Project";
      dto.description = "short"; // Too short
      dto.organizationId = "org-123";

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should throw ValidationException for invalid organizationId", async () => {
      const dto = new CreateProjectDto();
      dto.title = "Test Project";
      dto.description = "Test Description";
      dto.organizationId = "invalid-uuid";

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should throw InternalServerException when repository fails", async () => {
      const dto = new CreateProjectDto();
      dto.title = "Test Project";
      dto.description = "Test Description";
      dto.organizationId = "org-123";

      mockRepository.save.mockRejectedValue(new Error("Database error"));

      await expect(useCase.execute(dto)).rejects.toThrow(InternalServerException);
    });

    it("should use DRAFT status as default when not provided", async () => {
      const dto = new CreateProjectDto();
      dto.title = "Test Project";
      dto.description = "Test Description";
      dto.organizationId = "org-123";
      // status not provided

      const mockProject = Project.create({
        title: dto.title,
        description: dto.description,
        organizationId: dto.organizationId,
        status: ProjectStatus.DRAFT,
      });

      mockRepository.save.mockResolvedValue(mockProject);

      const result = await useCase.execute(dto);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            status: ProjectStatus.DRAFT,
          }),
        })
      );
      expect(result).toEqual(mockProject);
    });
  });
});
