import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { UserVolunteerService } from "../../application/services/UserVolunteerService";
import {
  PrismaClient,
  Prisma,
  User,
  Volunteer,
  UserVolunteer,
} from "@prisma/client";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import {
  VolunteerAlreadyRegisteredError,
  VolunteerNotFoundError,
  VolunteerPositionFullError,
} from "../../../../modules/volunteer/application/errors";

// Mock PrismaClient with proper type
const mockPrisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
const userVolunteerService = new UserVolunteerService(mockPrisma);

// Define types for mocked data with count
type VolunteerWithCount = Volunteer & {
  _count: {
    userVolunteers: number;
  };
};

type UserVolunteerWithRelations = UserVolunteer & {
  user: User;
  volunteer: Volunteer;
};

describe("UserVolunteerService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerVolunteerSafely", () => {
    const mockUser: User = {
      id: "user-id-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "Test User",
      lastName: "Test",
      email: "test@example.com",
      password: "password",
      wallet: "wallet-address",
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    };

    const mockVolunteer: Volunteer = {
      id: "volunteer-id-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "Test Volunteer Position",
      description: "Test Description",
      requirements: "Test Requirements",
      incentive: "Test Incentive",
      projectId: "project-id-1",
      maxVolunteers: 5,
    } as Volunteer;

    const mockUserVolunteer: UserVolunteer = {
      id: "user-volunteer-1",
      userId: mockUser.id,
      volunteerId: mockVolunteer.id,
      joinedAt: new Date(),
      hoursContributed: 0,
    } as UserVolunteer;

    const mockVolunteerWithCount: VolunteerWithCount = {
      ...mockVolunteer,
      _count: {
        userVolunteers: 0,
      },
    };

    const mockUserVolunteerWithRelations: UserVolunteerWithRelations = {
      ...mockUserVolunteer,
      user: mockUser,
      volunteer: mockVolunteer,
    };

    it("should successfully register a user to a volunteer position", async () => {
      // Mock the transaction
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === "function") {
          return fn(mockPrisma);
        }
        return Promise.resolve(fn);
      });

      mockPrisma.volunteer.findUnique.mockResolvedValue(mockVolunteerWithCount);
      mockPrisma.userVolunteer.findUnique.mockResolvedValue(null);
      mockPrisma.userVolunteer.create.mockResolvedValue(
        mockUserVolunteerWithRelations
      );

      const result = await userVolunteerService.registerVolunteerSafely(
        mockUser.id,
        mockVolunteer.id
      );

      expect(result).toBeDefined();
      expect(mockPrisma.volunteer.findUnique).toHaveBeenCalledWith({
        where: { id: mockVolunteer.id },
        include: {
          _count: {
            select: { userVolunteers: true },
          },
        },
      });
      expect(mockPrisma.userVolunteer.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          volunteerId: mockVolunteer.id,
        },
        include: {
          user: true,
          volunteer: true,
        },
      });
    });

    it("should throw an error when volunteer does not exist", async () => {
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === "function") {
          return fn(mockPrisma);
        }
        return Promise.resolve(fn);
      });
      mockPrisma.volunteer.findUnique.mockResolvedValue(null);

      await expect(
        userVolunteerService.registerVolunteerSafely(
          mockUser.id,
          "non-existent-id"
        )
      ).rejects.toThrow(VolunteerNotFoundError);
    });

    it("should throw an error when user is already registered", async () => {
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === "function") {
          return fn(mockPrisma);
        }
        return Promise.resolve(fn);
      });
      mockPrisma.volunteer.findUnique.mockResolvedValue(mockVolunteerWithCount);
      mockPrisma.userVolunteer.findUnique.mockResolvedValue(
        mockUserVolunteerWithRelations
      );

      await expect(
        userVolunteerService.registerVolunteerSafely(
          mockUser.id,
          mockVolunteer.id
        )
      ).rejects.toThrow(VolunteerAlreadyRegisteredError);
    });

    it("should throw an error when volunteer position is full", async () => {
      const maxVolunteers = 10;
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        if (typeof fn === "function") {
          return fn(mockPrisma);
        }
        return Promise.resolve(fn);
      });
      mockPrisma.volunteer.findUnique.mockResolvedValue({
        ...mockVolunteer,
        _count: { userVolunteers: maxVolunteers },
      } as VolunteerWithCount);
      mockPrisma.userVolunteer.findUnique.mockResolvedValue(null);

      await expect(
        userVolunteerService.registerVolunteerSafely(
          mockUser.id,
          mockVolunteer.id
        )
      ).rejects.toThrow(VolunteerPositionFullError);
    });

    it("should handle concurrent registration attempts safely", async () => {
      const maxVolunteers = 10;
      // First registration attempt
      mockPrisma.volunteer.findUnique.mockResolvedValueOnce(
        mockVolunteerWithCount
      );
      mockPrisma.userVolunteer.findUnique.mockResolvedValueOnce(null);
      mockPrisma.userVolunteer.create.mockResolvedValueOnce(
        mockUserVolunteerWithRelations
      );

      // Second concurrent registration attempt
      mockPrisma.volunteer.findUnique.mockResolvedValueOnce({
        ...mockVolunteer,
        _count: { userVolunteers: maxVolunteers },
      } as VolunteerWithCount);
      mockPrisma.userVolunteer.findUnique.mockResolvedValueOnce(null);

      // First registration should succeed
      const result1 = await userVolunteerService.registerVolunteerSafely(
        mockUser.id,
        mockVolunteer.id
      );
      expect(result1).toBeDefined();

      // Second registration should fail due to full capacity
      await expect(
        userVolunteerService.registerVolunteerSafely(
          "user-456",
          mockVolunteer.id
        )
      ).rejects.toThrow(VolunteerPositionFullError);
    });

    it("should use serializable isolation level for transaction", async () => {
      mockPrisma.volunteer.findUnique.mockResolvedValue(mockVolunteerWithCount);
      mockPrisma.userVolunteer.findUnique.mockResolvedValue(null);
      mockPrisma.userVolunteer.create.mockResolvedValue(
        mockUserVolunteerWithRelations
      );

      await userVolunteerService.registerVolunteerSafely(
        mockUser.id,
        mockVolunteer.id
      );

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          timeout: 5000,
        }
      );
    });
  });
});
