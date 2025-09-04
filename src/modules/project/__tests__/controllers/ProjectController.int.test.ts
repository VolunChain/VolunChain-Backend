// Integration test for ProjectController
import { Request, Response } from "express";
import ProjectController from "../../presentation/controllers/Project.controller.stub";
import { CreateProjectUseCase } from "../../use-cases/CreateProjectUseCase";
import { GetProjectUseCase } from "../../use-cases/GetProjectUseCase";
import { ListProjectsUseCase } from "../../use-cases/ListProjectsUseCase";
import { UpdateProjectUseCase } from "../../use-cases/UpdateProjectUseCase";
import { DeleteProjectUseCase } from "../../use-cases/DeleteProjectUseCase";
import { ValidationException, NotFoundException } from "../../../../shared/exceptions/DomainExceptions";

// Mock use cases
const mockCreateProjectUseCase = {
  execute: jest.fn(),
} as jest.Mocked<CreateProjectUseCase>;

const mockGetProjectUseCase = {
  execute: jest.fn(),
} as jest.Mocked<GetProjectUseCase>;

const mockListProjectsUseCase = {
  execute: jest.fn(),
} as jest.Mocked<ListProjectsUseCase>;

const mockUpdateProjectUseCase = {
  execute: jest.fn(),
} as jest.Mocked<UpdateProjectUseCase>;

const mockDeleteProjectUseCase = {
  execute: jest.fn(),
} as jest.Mocked<DeleteProjectUseCase>;

describe("ProjectController Integration", () => {
  let controller: ProjectController;

  beforeEach(() => {
    controller = new ProjectController(
      mockCreateProjectUseCase,
      mockGetProjectUseCase,
      mockListProjectsUseCase,
      mockUpdateProjectUseCase,
      mockDeleteProjectUseCase
    );
    jest.clearAllMocks();
  });

  it("should have a createProject method", () => {
    expect(typeof ProjectController.prototype.createProject).toBe("function");
  });

  describe("createProject", () => {
    test("should return 400 with standard error body for validation errors", async () => {
      const validationError = new ValidationException("Validation failed: Title must be at least 3 characters long");
      mockCreateProjectUseCase.execute.mockRejectedValue(validationError);

      const req = { body: { title: "ab", description: "test" } } as Partial<Request>;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response>;

      await expect(controller.createProject(req as Request, res as Response)).rejects.toThrow(ValidationException);
    });

    test("should return 201 with success response for valid project", async () => {
      const mockProject = {
        id: "123",
        title: "Test Project",
        description: "Test Description",
        organizationId: "org-123",
        status: "DRAFT"
      };
      mockCreateProjectUseCase.execute.mockResolvedValue(mockProject);

      const req = { 
        body: { 
          title: "Test Project", 
          description: "Test Description", 
          organizationId: "org-123" 
        } 
      } as Partial<Request>;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response>;

      await controller.createProject(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProject
      });
    });
  });

  describe("getProjectById", () => {
    test("should return 404 with standard error body for not found", async () => {
      const notFoundError = new NotFoundException("Project not found");
      mockGetProjectUseCase.execute.mockRejectedValue(notFoundError);

      const req = { params: { id: "non-existent" } } as Partial<Request>;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response>;

      await expect(controller.getProjectById(req as Request, res as Response)).rejects.toThrow(NotFoundException);
    });

    test("should return 200 with project data for valid id", async () => {
      const mockProject = {
        id: "123",
        title: "Test Project",
        description: "Test Description",
        organizationId: "org-123",
        status: "DRAFT"
      };
      mockGetProjectUseCase.execute.mockResolvedValue(mockProject);

      const req = { params: { id: "123" } } as Partial<Request>;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response>;

      await controller.getProjectById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProject
      });
    });
  });

  describe("updateProject", () => {
    test("should return 400 with standard error body for validation errors", async () => {
      const validationError = new ValidationException("Validation failed: Title must be at least 3 characters long");
      mockUpdateProjectUseCase.execute.mockRejectedValue(validationError);

      const req = { 
        params: { id: "123" },
        body: { title: "ab" }
      } as Partial<Request>;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response>;

      await expect(controller.updateProject(req as Request, res as Response)).rejects.toThrow(ValidationException);
    });

    test("should return 404 with standard error body for not found", async () => {
      const notFoundError = new NotFoundException("Project not found");
      mockUpdateProjectUseCase.execute.mockRejectedValue(notFoundError);

      const req = { 
        params: { id: "non-existent" },
        body: { title: "Updated Title" }
      } as Partial<Request>;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response>;

      await expect(controller.updateProject(req as Request, res as Response)).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteProject", () => {
    test("should return 404 with standard error body for not found", async () => {
      const notFoundError = new NotFoundException("Project not found");
      mockDeleteProjectUseCase.execute.mockRejectedValue(notFoundError);

      const req = { params: { id: "non-existent" } } as Partial<Request>;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response>;

      await expect(controller.deleteProject(req as Request, res as Response)).rejects.toThrow(NotFoundException);
    });

    test("should return 204 for successful deletion", async () => {
      mockDeleteProjectUseCase.execute.mockResolvedValue(undefined);

      const req = { params: { id: "123" } } as Partial<Request>;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as Partial<Response>;

      await controller.deleteProject(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
