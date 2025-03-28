import { PrismaClient } from "@prisma/client";
import { Volunteer } from "../../domain/volunteer.entity";
import { VolunteerPrismaRepository } from "../../repositories/implementations/volunteer-prisma.repository";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      volunteer: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    })),
  };
});

describe("VolunteerPrismaRepository", () => {
  let repository: VolunteerPrismaRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    repository = new VolunteerPrismaRepository(mockPrisma);
  });

  const validVolunteerData = {
    name: "Test Volunteer",
    description: "Test Description",
    requirements: "Test Requirements",
    projectId: "project-123",
    incentive: "Test Incentive",
  };

  describe("Create", () => {
    it("should create a volunteer", async () => {
      const mockCreatedVolunteer = {
        ...validVolunteerData,
        id: "volunteer-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.volunteer.create as jest.Mock).mockResolvedValue(
        mockCreatedVolunteer
      );

      const volunteer = Volunteer.create(validVolunteerData);
      const createdVolunteer = await repository.create(volunteer);

      expect(mockPrisma.volunteer.create).toHaveBeenCalledWith({
        data: expect.objectContaining(validVolunteerData),
      });
      expect(createdVolunteer).toBeInstanceOf(Volunteer);
      expect(createdVolunteer.id).toBe("volunteer-123");
    });
  });

  describe("FindById", () => {
    it("should find a volunteer by id", async () => {
      const mockVolunteer = {
        ...validVolunteerData,
        id: "volunteer-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.volunteer.findUnique as jest.Mock).mockResolvedValue(
        mockVolunteer
      );

      const foundVolunteer = await repository.findById("volunteer-123");

      expect(mockPrisma.volunteer.findUnique).toHaveBeenCalledWith({
        where: { id: "volunteer-123" },
      });
      expect(foundVolunteer).toBeInstanceOf(Volunteer);
      expect(foundVolunteer?.id).toBe("volunteer-123");
    });

    it("should return null if volunteer not found", async () => {
      (mockPrisma.volunteer.findUnique as jest.Mock).mockResolvedValue(null);

      const foundVolunteer = await repository.findById("non-existent-id");

      expect(foundVolunteer).toBeNull();
    });
  });

  describe("FindByProjectId", () => {
    it("should find volunteers by project id", async () => {
      const mockVolunteers = [
        {
          ...validVolunteerData,
          id: "volunteer-123",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          ...validVolunteerData,
          id: "volunteer-456",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.volunteer.findMany as jest.Mock).mockResolvedValue(
        mockVolunteers
      );

      const volunteers = await repository.findByProjectId("project-123");

      expect(mockPrisma.volunteer.findMany).toHaveBeenCalledWith({
        where: { projectId: "project-123" },
        skip: 0,
        take: 10,
      });
      expect(volunteers).toHaveLength(2);
      expect(volunteers[0]).toBeInstanceOf(Volunteer);
    });
  });

  describe("Update", () => {
    it("should update a volunteer", async () => {
      const volunteer = Volunteer.create({
        ...validVolunteerData,
        id: "volunteer-123",
      });

      const mockUpdatedVolunteer = {
        ...validVolunteerData,
        id: "volunteer-123",
        name: "Updated Name",
        updatedAt: new Date(),
      };

      (mockPrisma.volunteer.update as jest.Mock).mockResolvedValue(
        mockUpdatedVolunteer
      );

      volunteer.update({ name: "Updated Name" });
      const updatedVolunteer = await repository.update(volunteer);

      expect(mockPrisma.volunteer.update).toHaveBeenCalledWith({
        where: { id: "volunteer-123" },
        data: expect.objectContaining({ name: "Updated Name" }),
      });
      expect(updatedVolunteer.name).toBe("Updated Name");
    });
  });

  describe("Delete", () => {
    it("should delete a volunteer", async () => {
      (mockPrisma.volunteer.delete as jest.Mock).mockResolvedValue({});

      await repository.delete("volunteer-123");

      expect(mockPrisma.volunteer.delete).toHaveBeenCalledWith({
        where: { id: "volunteer-123" },
      });
    });
  });

  describe("Count", () => {
    it("should count volunteers for a project", async () => {
      (mockPrisma.volunteer.count as jest.Mock).mockResolvedValue(5);

      const count = await repository.count("project-123");

      expect(mockPrisma.volunteer.count).toHaveBeenCalledWith({
        where: { projectId: "project-123" },
      });
      expect(count).toBe(5);
    });
  });
});
