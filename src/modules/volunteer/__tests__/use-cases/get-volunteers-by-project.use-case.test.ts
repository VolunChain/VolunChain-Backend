import { GetVolunteersByProjectUseCase } from "../../use-cases/get-volunteers-by-project.use-case";
import { IVolunteerRepository } from "../../repositories/interfaces/volunteer-repository.interface";
import { Volunteer } from "../../domain/volunteer.entity";

describe("GetVolunteersByProjectUseCase", () => {
  let mockVolunteerRepository: jest.Mocked<IVolunteerRepository>;
  let getVolunteersByProjectUseCase: GetVolunteersByProjectUseCase;

  beforeEach(() => {
    mockVolunteerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByProjectId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    getVolunteersByProjectUseCase = new GetVolunteersByProjectUseCase(
      mockVolunteerRepository
    );
  });

  const projectId = "project-123";
  const mockVolunteers = [
    Volunteer.create({
      name: "Volunteer 1",
      description: "Description 1",
      requirements: "Requirements 1",
      projectId: projectId,
    }),
    Volunteer.create({
      name: "Volunteer 2",
      description: "Description 2",
      requirements: "Requirements 2",
      projectId: projectId,
    }),
  ];

  it("should retrieve volunteers for a project", async () => {
    mockVolunteerRepository.findByProjectId.mockResolvedValue(mockVolunteers);
    mockVolunteerRepository.count.mockResolvedValue(mockVolunteers.length);

    const result = await getVolunteersByProjectUseCase.execute(projectId);

    expect(mockVolunteerRepository.findByProjectId).toHaveBeenCalledWith(
      projectId,
      1,
      10
    );
    expect(mockVolunteerRepository.count).toHaveBeenCalledWith(projectId);
    expect(result.volunteers).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it("should handle pagination", async () => {
    const page = 2;
    const pageSize = 5;

    mockVolunteerRepository.findByProjectId.mockResolvedValue(mockVolunteers);
    mockVolunteerRepository.count.mockResolvedValue(10);

    const result = await getVolunteersByProjectUseCase.execute(
      projectId,
      page,
      pageSize
    );

    expect(mockVolunteerRepository.findByProjectId).toHaveBeenCalledWith(
      projectId,
      page,
      pageSize
    );
    expect(result.page).toBe(page);
    expect(result.pageSize).toBe(pageSize);
  });
});
