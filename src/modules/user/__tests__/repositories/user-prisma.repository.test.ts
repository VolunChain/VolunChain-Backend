import { UserPrismaRepository } from "../../infrastructure/repositories/implementations/user-prisma.repository";
import { CreateUserData, UpdateUserData } from "../../domain/dto/UserDTO";
import { PrismaClient, Prisma } from "@prisma/client";
import { ResourceNotFoundError, ResourceConflictError, ValidationError } from "../../../../shared/application/errors";

// Mock Prisma
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as unknown as PrismaClient;

describe("UserPrismaRepository", () => {
  let repository: UserPrismaRepository;

  beforeEach(() => {
    repository = new UserPrismaRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe("create", () => {
    const createUserData: CreateUserData = {
      name: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashedPassword",
      wallet: "GABCDEF123456789",
    };

    const mockUser = {
      id: "user-123",
      name: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashedPassword",
      wallet: "GABCDEF123456789",
      isVerified: false,
      verificationToken: null,
      verificationTokenExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should create a user successfully", async () => {
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.create(createUserData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserData.name,
          lastName: createUserData.lastName,
          email: createUserData.email,
          password: createUserData.password,
          wallet: createUserData.wallet,
          isVerified: false,
          verificationToken: undefined,
          verificationTokenExpires: undefined,
        }
      });

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        lastName: mockUser.lastName,
        email: mockUser.email,
        wallet: mockUser.wallet,
        isVerified: mockUser.isVerified,
        verificationToken: mockUser.verificationToken,
        verificationTokenExpires: mockUser.verificationTokenExpires,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it("should throw ResourceConflictError on P2002 error", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "1.0.0",
      });

      (mockPrisma.user.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(repository.create(createUserData)).rejects.toThrow(ResourceConflictError);
    });
  });

  describe("findById", () => {
    const mockUser = {
      id: "user-123",
      name: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashedPassword",
      wallet: "GABCDEF123456789",
      isVerified: false,
      verificationToken: null,
      verificationTokenExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should find user by id successfully", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findById("user-123");

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" }
      });

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        lastName: mockUser.lastName,
        email: mockUser.email,
        wallet: mockUser.wallet,
        isVerified: mockUser.isVerified,
        verificationToken: mockUser.verificationToken,
        verificationTokenExpires: mockUser.verificationTokenExpires,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it("should return null when user not found", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById("user-123");

      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    const mockUser = {
      id: "user-123",
      name: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashedPassword",
      wallet: "GABCDEF123456789",
      isVerified: false,
      verificationToken: null,
      verificationTokenExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should find user by email successfully", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findByEmail("john@example.com");

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" }
      });

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        lastName: mockUser.lastName,
        email: mockUser.email,
        wallet: mockUser.wallet,
        isVerified: mockUser.isVerified,
        verificationToken: mockUser.verificationToken,
        verificationTokenExpires: mockUser.verificationTokenExpires,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it("should return null when user not found", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    const updateUserData: UpdateUserData = {
      name: "Jane",
      lastName: "Smith",
    };

    const mockUpdatedUser = {
      id: "user-123",
      name: "Jane",
      lastName: "Smith",
      email: "john@example.com",
      password: "hashedPassword",
      wallet: "GABCDEF123456789",
      isVerified: false,
      verificationToken: null,
      verificationTokenExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should update user successfully", async () => {
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await repository.update("user-123", updateUserData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          name: "Jane",
          lastName: "Smith",
        }
      });

      expect(result).toEqual({
        id: mockUpdatedUser.id,
        name: mockUpdatedUser.name,
        lastName: mockUpdatedUser.lastName,
        email: mockUpdatedUser.email,
        wallet: mockUpdatedUser.wallet,
        isVerified: mockUpdatedUser.isVerified,
        verificationToken: mockUpdatedUser.verificationToken,
        verificationTokenExpires: mockUpdatedUser.verificationTokenExpires,
        createdAt: mockUpdatedUser.createdAt,
        updatedAt: mockUpdatedUser.updatedAt,
      });
    });

    it("should throw ResourceNotFoundError on P2025 error", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: "P2025",
        clientVersion: "1.0.0",
      });

      (mockPrisma.user.update as jest.Mock).mockRejectedValue(prismaError);

      await expect(repository.update("user-123", updateUserData)).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete user successfully", async () => {
      (mockPrisma.user.delete as jest.Mock).mockResolvedValue({});

      await repository.delete("user-123");

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: "user-123" }
      });
    });

    it("should throw ResourceNotFoundError on P2025 error", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: "P2025",
        clientVersion: "1.0.0",
      });

      (mockPrisma.user.delete as jest.Mock).mockRejectedValue(prismaError);

      await expect(repository.delete("user-123")).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe("findAll", () => {
    const mockUsers = [
      {
        id: "user-1",
        name: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "hashedPassword",
        wallet: "GABCDEF123456789",
        isVerified: false,
        verificationToken: null,
        verificationTokenExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "user-2",
        name: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        password: "hashedPassword",
        wallet: "GABCDEF987654321",
        isVerified: false,
        verificationToken: null,
        verificationTokenExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    it("should find all users with pagination", async () => {
      (mockPrisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (mockPrisma.user.count as jest.Mock).mockResolvedValue(2);

      const result = await repository.findAll(1, 10);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      expect(mockPrisma.user.count).toHaveBeenCalled();

      expect(result).toEqual({
        users: mockUsers.map(user => ({
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          wallet: user.wallet,
          isVerified: user.isVerified,
          verificationToken: user.verificationToken,
          verificationTokenExpires: user.verificationTokenExpires,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        total: 2
      });
    });
  });

  describe("error handling", () => {
    it("should throw ValidationError on PrismaClientValidationError", async () => {
      const validationError = new Prisma.PrismaClientValidationError("Validation failed");

      (mockPrisma.user.create as jest.Mock).mockRejectedValue(validationError);

      await expect(repository.create({
        name: "John",
        email: "invalid-email",
        password: "password",
        wallet: "invalid-wallet",
      })).rejects.toThrow(ValidationError);
    });

    it("should re-throw unexpected errors", async () => {
      const unexpectedError = new Error("Unexpected error");

      (mockPrisma.user.create as jest.Mock).mockRejectedValue(unexpectedError);

      await expect(repository.create({
        name: "John",
        email: "john@example.com",
        password: "password",
        wallet: "GABCDEF123456789",
      })).rejects.toThrow("Unexpected error");
    });
  });
});
