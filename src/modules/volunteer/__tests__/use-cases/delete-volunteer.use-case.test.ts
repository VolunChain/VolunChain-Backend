import { DeleteVolunteerUseCase } from "../../use-cases/delete-volunteer.use-case";
import { IVolunteerRepository } from "../../repositories/interfaces/volunteer-repository.interface";
import { Volunteer } from "../../domain/volunteer.entity";

describe("DeleteVolunteerUseCase", () => {
  let mockVolunteerRepository: jest.Mocked<IVolunteerRepository>;
  let deleteVolunteerUseCase: DeleteVolunteerUseCase;

  beforeEach(() => {
    mockVolunteerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByProjectId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    deleteVolunteerUseCase = new DeleteVolunteerUseCase(
      mockVolunteerRepository
    );
  });

  const existingVolunteer = Volunteer.create({
    id: "volunteer-123",
    name: "Test Volunteer",
    description: "Test Description",
    requirements: "Test Requirements",
    projectId: "project-123",
  });

  it("should delete a volunteer successfully", async () => {
    // Mock findById to return existing volunteer
    mockVolunteerRepository.findById.mockResolvedValue(existingVolunteer);

    // Mock delete method
    mockVolunteerRepository.delete.mockResolvedValue();

    // Execute delete
    await deleteVolunteerUseCase.execute("volunteer-123");

    // Assertions
    expect(mockVolunteerRepository.findById).toHaveBeenCalledWith(
      "volunteer-123"
    );
    expect(mockVolunteerRepository.delete).toHaveBeenCalledWith(
      "volunteer-123"
    );
  });

  it("should throw error when volunteer not found", async () => {
    // Mock findById to return null
    mockVolunteerRepository.findById.mockResolvedValue(null);

    // Attempt to delete non-existent volunteer
    await expect(
      deleteVolunteerUseCase.execute("non-existent-id")
    ).rejects.toThrow("Volunteer not found");
  });
});
