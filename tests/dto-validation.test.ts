import { validate } from "class-validator";
import { RegisterDTO } from "../src/modules/auth/dto/emailVerification.dto";

describe("DTO Validation", () => {
  describe("RegisterDTO", () => {
    it("should validate correct data", async () => {
      const dto: RegisterDTO = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "SecurePassword123",
        wallet: "0x1234567890abcdef",
      };
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should validate required fields", async () => {
      const dto = new RegisterDTO({
        email: "john.doe@example.com",
        password: "SecurePassword123",
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(2);
      expect(errors[0].property).toBe("name");
      expect(errors[1].property).toBe("wallet");
      expect(errors[0].constraints?.required).toBe("Name is required");
      expect(errors[1].constraints?.required).toBe("Wallet is required");
    });

    it("should validate email format", async () => {
      const dto = new RegisterDTO({
        name: "John Doe",
        email: "invalid-email",
        password: "SecurePassword123",
        wallet: "0x1234567890abcdef",
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("email");
      expect(errors[0].constraints?.email).toBeDefined();
    });

    it("should validate password length", async () => {
      const dto = new RegisterDTO({
        name: "John Doe",
        email: "john.doe@example.com",
        password: "short", // Too short
        wallet: "0x1234567890abcdef",
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("password");
      expect(errors[0].constraints?.minlength).toBe(
        "Password must be at least 8 characters long"
      );
    });
  });
});
