import { CreateVolunteerUseCase } from "../../use-cases/create-volunteer.use-case";
import { IVolunteerRepository } from "../../repositories/interfaces/volunteer-repository.interface";
import { Volunteer } from "../../domain/volunteer.entity";

describe("CreateVolunteerUseCase", () => {
  let mockVolunteerRepository: jest.Mocked<IVolunteerRepository>;
  let createVolunteerUseCase: CreateVolunteerUseCase;

  beforeEach(() => {
    mockVolunteerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByProjectId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    createVolunteerUseCase = new CreateVolunteerUseCase(
      mockVolunteerRepository
    );
  });

  const validVolunteerData = {
    name: "Test Volunteer",
    description: "Test Description",
    requirements: "Test Requirements",
    projectId: "project-123",
    incentive: "Test Incentive",
  };

  it("should create a volunteer successfully", async () => {
    const mockVolunteer = Volunteer.create(validVolunteerData);

    mockVolunteerRepository.create.mockResolvedValue(mockVolunteer);

    const createdVolunteer =
      await createVolunteerUseCase.execute(validVolunteerData);

    expect(mockVolunteerRepository.create).toHaveBeenCalledWith(
      expect.any(Volunteer)
    );
    expect(createdVolunteer).toBeInstanceOf(Volunteer);
    expect(createdVolunteer.name).toBe(validVolunteerData.name);
  });

  it("should throw error for invalid volunteer data", async () => {
    const invalidVolunteerData = {
      ...validVolunteerData,
      name: "",
    };

    await expect(
      createVolunteerUseCase.execute(invalidVolunteerData)
    ).rejects.toThrow("Name is required");
  });
});
