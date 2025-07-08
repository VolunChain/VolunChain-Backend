import { validate } from "class-validator";
import { VerifyEmailDTO } from "../../dto/verifyEmailDTO";

describe("VerifyEmailDTO - DTO validation", () => {
  it("should validate correct token", async () => {
    const dto = new VerifyEmailDTO();
    dto.token = "valid-token-123";
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it("should fail with empty token", async () => {
    const dto = new VerifyEmailDTO();
    dto.token = "";
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe("token");
  });

  it("should fail with invalid type", async () => {
    const dto = new VerifyEmailDTO();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dto.token = 123 as any; // Invalid type
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe("token");
  });
});
