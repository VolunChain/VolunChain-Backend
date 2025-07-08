import { Project, ProjectStatus } from "../../../domain/entities/project.entity"

describe("Project Entity", () => {
  let project: Project

  beforeEach(() => {
    project = new Project()
    project.name = "Test Project"
    project.description = "Test Description"
    project.location = "Test Location"
    project.startDate = new Date("2024-01-01")
    project.endDate = new Date("2024-12-31")
    project.organizationId = "org-123"
    project.status = ProjectStatus.DRAFT
  })

  describe("Creation", () => {
    it("should create a project with valid properties", () => {
      expect(project.name).toBe("Test Project")
      expect(project.description).toBe("Test Description")
      expect(project.location).toBe("Test Location")
      expect(project.status).toBe(ProjectStatus.DRAFT)
    })

    it("should have default status as DRAFT", () => {
      const newProject = new Project()
      expect(newProject.status).toBe(ProjectStatus.DRAFT)
    })
  })

  describe("Status Management", () => {
    it("should activate a draft project", () => {
      project.activate()
      expect(project.status).toBe(ProjectStatus.ACTIVE)
    })

    it("should throw error when activating non-draft project", () => {
      project.status = ProjectStatus.ACTIVE
      expect(() => project.activate()).toThrow("Only draft projects can be activated")
    })

    it("should complete an active project", () => {
      project.status = ProjectStatus.ACTIVE
      project.complete()
      expect(project.status).toBe(ProjectStatus.COMPLETED)
    })

    it("should throw error when completing non-active project", () => {
      expect(() => project.complete()).toThrow("Only active projects can be completed")
    })

    it("should cancel a draft or active project", () => {
      project.cancel()
      expect(project.status).toBe(ProjectStatus.CANCELLED)

      project.status = ProjectStatus.ACTIVE
      project.cancel()
      expect(project.status).toBe(ProjectStatus.CANCELLED)
    })

    it("should throw error when cancelling completed project", () => {
      project.status = ProjectStatus.COMPLETED
      expect(() => project.cancel()).toThrow("Completed projects cannot be cancelled")
    })
  })

  describe("Status Checks", () => {
    it("should check if project is active", () => {
      expect(project.isActive()).toBe(false)

      project.status = ProjectStatus.ACTIVE
      expect(project.isActive()).toBe(true)
    })

    it("should check if project is completed", () => {
      expect(project.isCompleted()).toBe(false)

      project.status = ProjectStatus.COMPLETED
      expect(project.isCompleted()).toBe(true)
    })
  })
})
