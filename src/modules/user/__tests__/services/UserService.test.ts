import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { UserService } from "../../application/services/UserService";
import { PrismaUserRepository } from "../../repositories/PrismaUserRepository";
import { CreateUserDto } from "../../dto/CreateUserDto";
import { UpdateUserDto } from "../../dto/UpdateUserDto";

jest.mock("../../repositories/PrismaUserRepository");

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<PrismaUserRepository>;

  beforeEach(() => {
    mockUserRepository =
      new PrismaUserRepository() as jest.Mocked<PrismaUserRepository>;
    userService = new UserService();
  });

  it("should create a user", async () => {
    const dto: CreateUserDto = {
      name: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "pass",
      wallet: "wallet",
      isVerified: false,
    };
    mockUserRepository.create = jest
      .fn()
      .mockResolvedValue({ ...dto, id: "1" });
    const result = await userService.createUser(dto);
    expect(result).toBeDefined();
  });

  it("should get user by id", async () => {
    mockUserRepository.findById = jest.fn().mockResolvedValue({ id: "1" });
    const result = await userService.getUserById("1");
    expect(result).toBeDefined();
  });

  it("should update user", async () => {
    const dto: UpdateUserDto = { id: "1", name: "Updated" };
    mockUserRepository.update = jest.fn().mockResolvedValue(undefined);
    await expect(userService.updateUser(dto)).resolves.toBeUndefined();
  });
});
