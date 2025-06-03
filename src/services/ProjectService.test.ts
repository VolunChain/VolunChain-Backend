import ProjectService from "../../src/services/ProjectService"
import { ValidationError } from "../../src/errors"
import * as transactionHelper from "../../src/utils/transaction.helper"

// Mock dependencies
jest.mock("../../src/config/prisma", () => ({
  prisma: {
    project: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    volunteer: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}))

jest.mock("../../src/utils/transaction.helper")

describe("ProjectService", () => {
  let projectService: ProjectService
  let mockWithTransaction: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    projectService = new ProjectService()
    mockWithTransaction = jest.spyOn(transactionHelper, "withTransaction")
  })

  describe("createProject", () => {
    const validProjectData = {
      name: "Test Project",
      description: "Test Description",
      location: "Test Location",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      organizationId: "org-123",
    }

    it("should create project successfully", async () => {
      const mockProject = {
        id: "project-123",
        ...validProjectData,
        createdAt: new Date(),
        updatedAt: new Date(),
        volunteers: [],
      }

      mockWithTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          project: {
            create: jest.fn().mockResolvedValue(mockProject),
          },
        }
        return await callback(mockTx)
      })

      const result = await projectService.createProject(validProjectData)

      expect(result).toBeDefined()
      expect(result.name).toBe(validProjectData.name)
      expect(mockWithTransaction).toHaveBeenCalled()
    })

    it("should create project with initial volunteers", async () => {
      const projectDataWithVolunteers = {
        ...validProjectData,
        initialVolunteers: [
          {
            name: "Volunteer 1",
            description: "Description 1",
            requirements: "Requirements 1",
          },
        ],
      }

      const mockProject = {
        id: "project-123",
        ...validProjectData,
        createdAt: new Date(),
        updatedAt: new Date(),
        volunteers: [
          {
            id: "volunteer-123",
            name: "Volunteer 1",
            description: "Description 1",
            requirements: "Requirements 1",
            incentive: null,
            projectId: "project-123",
            createdAt: new Date(),
            updatedAt: new Date(),
            project: {
              id: "project-123",
              name: validProjectData.name,
              description: validProjectData.description,
              location: validProjectData.location,
              startDate: validProjectData.startDate,
              endDate: validProjectData.endDate,
              createdAt: new Date(),
              updatedAt: new Date(),
              organizationId: validProjectData.organizationId,
            },
          },
        ],
      }

      mockWithTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          project: {
            create: jest.fn().mockResolvedValue({ ...mockProject, volunteers: [] }),
            findUnique: jest.fn().mockResolvedValue(mockProject),
          },
          volunteer: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        }
        return await callback(mockTx)
      })

      const result = await projectService.createProject(projectDataWithVolunteers)

      expect(result).toBeDefined()
      expect(result.volunteers).toHaveLength(1)
      expect(mockWithTransaction).toHaveBeenCalled()
    })

    it("should validate project data and throw ValidationError", async () => {
      const invalidData = {
        ...validProjectData,
        name: "", // Invalid empty name
      }

      await expect(projectService.createProject(invalidData)).rejects.toThrow(ValidationError)
      expect(mockWithTransaction).not.toHaveBeenCalled()
    })

    it("should throw ValidationError for invalid date range", async () => {
      const invalidData = {
        ...validProjectData,
        startDate: new Date("2025-12-31"),
        endDate: new Date("2025-01-01"), // End date before start date
      }

      await expect(projectService.createProject(invalidData)).rejects.toThrow(ValidationError)
    })
  })

  describe("updateProject", () => {
    it("should update project successfully", async () => {
      const updateData = {
        name: "Updated Project Name",
        description: "Updated Description",
      }

      const mockUpdatedProject = {
        id: "project-123",
        name: updateData.name,
        description: updateData.description,
        location: "Test Location",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        organizationId: "org-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        volunteers: [],
      }

      mockWithTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          project: {
            findUnique: jest.fn().mockResolvedValue({ id: "project-123" }),
            update: jest.fn().mockResolvedValue(mockUpdatedProject),
          },
        }
        return await callback(mockTx)
      })

      const result = await projectService.updateProject("project-123", updateData)

      expect(result).toBeDefined()
      expect(result.name).toBe(updateData.name)
      expect(mockWithTransaction).toHaveBeenCalled()
    })

    it("should throw ValidationError when project not found", async () => {
      mockWithTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          project: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        }
        return await callback(mockTx)
      })

      await expect(projectService.updateProject("nonexistent-id", { name: "New Name" })).rejects.toThrow(
        ValidationError,
      )
    })
  })

  describe("deleteProject", () => {
    it("should delete project and volunteers successfully", async () => {
      const mockProject = {
        id: "project-123",
        volunteers: [{ id: "volunteer-1" }, { id: "volunteer-2" }],
      }

      mockWithTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          project: {
            findUnique: jest.fn().mockResolvedValue(mockProject),
            delete: jest.fn().mockResolvedValue({}),
          },
          volunteer: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        }
        return await callback(mockTx)
      })

      await expect(projectService.deleteProject("project-123")).resolves.not.toThrow()
      expect(mockWithTransaction).toHaveBeenCalled()
    })

    it("should throw ValidationError when project not found", async () => {
      mockWithTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          project: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        }
        return await callback(mockTx)
      })

      await expect(projectService.deleteProject("nonexistent-id")).rejects.toThrow(ValidationError)
    })
  })

  describe("addVolunteersToProject", () => {
    it("should add volunteers to project successfully", async () => {
      const volunteers = [
        {
          name: "Volunteer 1",
          description: "Description 1",
          requirements: "Requirements 1",
        },
      ]

      const mockProject = {
        id: "project-123",
        name: "Test Project",
        description: "Test Description",
        location: "Test Location",
        startDate: new Date(),
        endDate: new Date(),
        organizationId: "org-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockCreatedVolunteers = [
        {
          id: "volunteer-123",
          ...volunteers[0],
          projectId: "project-123",
          incentive: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          project: mockProject,
        },
      ]

      mockWithTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          project: {
            findUnique: jest.fn().mockResolvedValue(mockProject),
          },
          volunteer: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
            findMany: jest.fn().mockResolvedValue(mockCreatedVolunteers),
          },
        }
        return await callback(mockTx)
      })

      const result = await projectService.addVolunteersToProject("project-123", volunteers)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe(volunteers[0].name)
      expect(mockWithTransaction).toHaveBeenCalled()
    })

    it("should throw ValidationError when project not found", async () => {
      mockWithTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          project: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        }
        return await callback(mockTx)
      })

      await expect(projectService.addVolunteersToProject("nonexistent-id", [])).rejects.toThrow(ValidationError)
    })
  })
})
