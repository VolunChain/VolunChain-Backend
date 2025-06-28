import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import VolunteerService from "../../application/services/VolunteerService";
import { VolunteerPrismaRepository } from "../../repositories/implementations/volunteer-prisma.repository";
import { CreateVolunteerDTO } from "../../dto/volunteer.dto";

jest.mock("../../repositories/implementations/volunteer-prisma.repository");

describe("VolunteerService", () => {
  let volunteerService: VolunteerService;
  let mockVolunteerRepository: jest.Mocked<VolunteerPrismaRepository>;

  beforeEach(() => {
    mockVolunteerRepository =
      new VolunteerPrismaRepository() as jest.Mocked<VolunteerPrismaRepository>;
    volunteerService = new VolunteerService();
  });

  it("should create a volunteer", async () => {
    const dto: CreateVolunteerDTO = {
      name: "Test",
      description: "desc",
      requirements: "req",
      projectId: "1",
      maxVolunteers: 5,
    };
    mockVolunteerRepository.create = jest
      .fn()
      .mockResolvedValue({ ...dto, id: "1" });
    const result = await volunteerService.createVolunteer(dto);
    expect(result).toBeDefined();
  });

  it("should get volunteer by id", async () => {
    mockVolunteerRepository.findById = jest.fn().mockResolvedValue({ id: "1" });
    const result = await volunteerService.getVolunteerById("1");
    expect(result).toBeDefined();
  });
});
