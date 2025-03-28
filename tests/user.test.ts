import request from "supertest";
import app from "../src/index";
import { AppDataSource } from "../src/config/ormconfig";

let userId: string;
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

describe("User API", () => {
  it("should create a new user", async () => {
    const res = await request(app).post("/users").send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe(testUser.email);
    userId = res.body.id;
  });

  it("should get user by ID", async () => {
    const res = await request(app).get(`/users/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it("should return 404 for non-existent user ID", async () => {
    const res = await request(app).get("/users/non-existent-id");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  it("should get user by email", async () => {
    const res = await request(app).get(`/users?email=${testUser.email}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it("should return 400 if email is not provided", async () => {
    const res = await request(app).get("/users");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email is required");
  });

  it("should return 404 for non-existent user email", async () => {
    const res = await request(app).get("/users?email=nonexistent@example.com");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  it("should not allow duplicate email", async () => {
    const res = await request(app).post("/users").send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email already exists");
  });
});
