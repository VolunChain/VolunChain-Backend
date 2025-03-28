import request from "supertest";
import app from "../src/index";
import { AppDataSource } from "../src/config/ormconfig";

let userId: string;
let verificationToken: string;

const testUser = {
  name: "Alice",
  lastName: "Doe",
  email: "alice@example.com",
  password: "securepassword",
  wallet: "0x987654321abcdef",
};

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe("Email Verification API", () => {
  it("should register a new user and send a verification email", async () => {
    const res = await request(app).post("/auth/register").send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("verificationToken");
    expect(res.body.email).toBe(testUser.email);

    userId = res.body.id;
    verificationToken = res.body.verificationToken;
  });

  it("should verify user email with a valid token", async () => {
    const res = await request(app).get(
      `/auth/verify-email?token=${verificationToken}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Email verified successfully");
  });

  it("should not verify email with an invalid token", async () => {
    const res = await request(app).get("/auth/verify-email?token=invalidtoken");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid or expired verification token");
  });

  it("should not allow unverified users to access protected routes", async () => {
    const res = await request(app)
      .get("/protected-route")
      .set("Authorization", `Bearer unverifiedUserToken`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Email not verified");
  });

  it("should allow verified users to access protected routes", async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const token = loginRes.body.token;

    const res = await request(app)
      .get("/protected-route")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("should resend verification email if requested", async () => {
    const res = await request(app)
      .post("/auth/resend-verification")
      .send({ email: testUser.email });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Verification email resent successfully");
  });

  it("should return error for resending verification to a verified email", async () => {
    const res = await request(app)
      .post("/auth/resend-verification")
      .send({ email: testUser.email });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email already verified");
  });
});
