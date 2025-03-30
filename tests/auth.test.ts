import request from "supertest";
import app from "../src/index";

describe("Email Verification", () => {
  it("should send verification email", async () => {
    const res = await request(app)
      .post("/auth/resend-verification")
      .send({ email: "test@example.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Verification email sent");
  });

  it("should verify email", async () => {
    const token = "valid-test-token";
    const res = await request(app).post("/auth/verify").send({ token });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Email verified successfully");
  });
});
