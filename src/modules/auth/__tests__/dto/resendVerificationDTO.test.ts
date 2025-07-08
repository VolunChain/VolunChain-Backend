import { validate } from "class-validator";
import { ResendVerificationDTO } from "../../dto/resendVerificationDTO";

describe("ResendVerificationDTO - DTO validation", () => {
  it("should validate correct email", async () => {
    const dto = new ResendVerificationDTO();
    dto.email = "test@example.com";
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("should fail with invalid email", async () => {
    const dto = new ResendVerificationDTO();
    dto.email = "invalid-email";
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe("email");
  });

  it("should fail with empty email", async () => {
    const dto = new ResendVerificationDTO();
    dto.email = "";
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe("email");
  });
});
