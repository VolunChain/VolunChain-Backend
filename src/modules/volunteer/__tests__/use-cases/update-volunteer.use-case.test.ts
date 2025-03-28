import { UpdateVolunteerUseCase } from "../../use-cases/update-volunteer.use-case";
import { IVolunteerRepository } from "../../repositories/interfaces/volunteer-repository.interface";
import { Volunteer } from "../../domain/volunteer.entity";

describe("UpdateVolunteerUseCase", () => {
  let mockVolunteerRepository: jest.Mocked<IVolunteerRepository>;
  let updateVolunteerUseCase: UpdateVolunteerUseCase;

  beforeEach(() => {
    mockVolunteerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByProjectId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    updateVolunteerUseCase = new UpdateVolunteerUseCase(
      mockVolunteerRepository
    );
  });

  const existingVolunteer = Volunteer.create({
    id: "volunteer-123",
    name: "Existing Volunteer",
    description: "Existing Description",
    requirements: "Existing Requirements",
    projectId: "project-123",
  });

  it("should update a volunteer successfully", async () => {
    // Mock findById to return existing volunteer
    mockVolunteerRepository.findById.mockResolvedValue(existingVolunteer);

    // Mock update to return updated volunteer
    const updatedVolunteer = Volunteer.create({
      ...existingVolunteer.toObject(),
      name: "Updated Volunteer Name",
    });
    mockVolunteerRepository.update.mockResolvedValue(updatedVolunteer);

    // Execute update
    const result = await updateVolunteerUseCase.execute("volunteer-123", {
      name: "Updated Volunteer Name",
    });

    // Assertions
    expect(mockVolunteerRepository.findById).toHaveBeenCalledWith(
      "volunteer-123"
    );
    expect(mockVolunteerRepository.update).toHaveBeenCalled();
    expect(result.name).toBe("Updated Volunteer Name");
  });

  it("should throw error when volunteer not found", async () => {
    // Mock findById to return null
    mockVolunteerRepository.findById.mockResolvedValue(null);

    // Attempt to update non-existent volunteer
    await expect(
      updateVolunteerUseCase.execute("non-existent-id", {
        name: "Updated Name",
      })
    ).rejects.toThrow("Volunteer not found");
  });

  it("should throw validation error for invalid update", async () => {
    // Create existing volunteer
    const invalidVolunteer = Volunteer.create({
      id: "volunteer-123",
      name: "Existing Volunteer",
      description: "Existing Description",
      requirements: "Existing Requirements",
      projectId: "project-123",
    });

    // Mock findById to return existing volunteer
    mockVolunteerRepository.findById.mockResolvedValue(invalidVolunteer);

    // Attempt to update with invalid data
    await expect(
      updateVolunteerUseCase.execute("volunteer-123", {
        name: "",
      })
    ).rejects.toThrow("Name is required");
  });
});
