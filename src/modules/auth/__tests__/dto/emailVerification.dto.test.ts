import { RegisterDTO } from "../../dto/emailVerification.dto";

describe("RegisterDTO - DTO validation", () => {
  it("should validate correct data", async () => {
    const dto = new RegisterDTO({
      name: "John Doe",
      email: "john.doe@example.com",
      password: "SecurePassword123",
      wallet: "0x1234567890abcdef",
    });
    const errors = await RegisterDTO.validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("should validate required fields", async () => {
    const dto = new RegisterDTO({
      email: "john.doe@example.com",
      password: "SecurePassword123",
    });
    const errors = await RegisterDTO.validate(dto);
    expect(errors).toHaveLength(2);
    expect(errors[0].property).toBe("name");
    expect(errors[1].property).toBe("wallet");
  });

  it("should validate email format", async () => {
    const dto = new RegisterDTO({
      name: "John Doe",
      email: "invalid-email",
      password: "SecurePassword123",
      wallet: "0x1234567890abcdef",
    });
    const errors = await RegisterDTO.validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe("email");
  });

  it("should validate password length", async () => {
    const dto = new RegisterDTO({
      name: "John Doe",
      email: "john.doe@example.com",
      password: "short",
      wallet: "0x1234567890abcdef",
    });
    const errors = await RegisterDTO.validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe("password");
  });

  it("should fail with invalid email", async () => {
    const dto = new RegisterDTO();
    dto.email = "invalid-email";
    const errors = await RegisterDTO.validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
