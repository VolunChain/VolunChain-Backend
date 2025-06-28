import { describe, it, expect, beforeEach } from "@jest/globals";
import { UserService } from "../../application/services/UserService";
import { CreateUserDto } from "../../dto/CreateUserDto";
import { UpdateUserDto } from "../../dto/UpdateUserDto";

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    userService = new UserService();
    // Patch the internal repository instance with manual mocks
    (userService as any).userRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      // Add other methods as needed
    };
  });

  it("should create a user", async () => {
    const dto: CreateUserDto = {
      name: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "pass",
      wallet: "wallet",
    };
    (userService as any).userRepository.create.mockResolvedValue({
      ...dto,
      id: "1",
    });
    const result = await userService.createUser(dto);
    expect(result).toBeDefined();
  });

  it("should get user by id", async () => {
    (userService as any).userRepository.findById.mockResolvedValue({ id: "1" });
    const result = await userService.getUserById("1");
    expect(result).toBeDefined();
  });

  it("should update user", async () => {
    const dto: UpdateUserDto = {
      id: "1",
      name: "Updated",
      lastName: "User",
      email: "test@example.com",
      password: "pass",
      wallet: "wallet",
    };
    (userService as any).userRepository.update.mockResolvedValue(undefined);
    await expect(userService.updateUser(dto)).resolves.toBeUndefined();
  });
});
