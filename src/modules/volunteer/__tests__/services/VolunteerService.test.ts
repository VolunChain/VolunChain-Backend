import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import VolunteerService from "../../application/services/VolunteerService";
import { CreateVolunteerDTO } from "../../dto/volunteer.dto";

jest.mock("../../repositories/implementations/volunteer-prisma.repository");

describe("VolunteerService", () => {
  let volunteerService: VolunteerService;

  beforeEach(() => {
    jest.clearAllMocks();
    volunteerService = new VolunteerService();
    // Patch the internal repository instance with manual mocks
    (volunteerService as any).volunteerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      // Add other methods as needed
    };
  });

  it("should create a volunteer", async () => {
    const dto: CreateVolunteerDTO = {
      name: "Test",
      description: "desc",
      requirements: "req",
      projectId: "1",
    };
    const volunteer = { ...dto, id: "1" } as any;
    (volunteerService as any).volunteerRepository.create.mockResolvedValue(
      volunteer
    );
    const result = await volunteerService.createVolunteer(dto);
    expect(result).toBeDefined();
  });

  it("should get volunteer by id", async () => {
    const volunteer = { id: "1" } as any;
    (volunteerService as any).volunteerRepository.findById.mockResolvedValue(
      volunteer
    );
    const result = await volunteerService.getVolunteerById("1");
    expect(result).toBeDefined();
  });
});
