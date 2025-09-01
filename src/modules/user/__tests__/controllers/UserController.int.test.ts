// Integration test for UserController
import request from "supertest";
import express, { Express } from "express";
import UserController from "../../presentation/controllers/UserController";

// Mock the repository
jest.mock("../../../../shared/infrastructure/container", () => ({
  container: {
    [Symbol.for("USER_REPOSITORY")]: {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
  USER_REPOSITORY: Symbol.for("USER_REPOSITORY"),
}));

import { container, USER_REPOSITORY } from "../../../../shared/infrastructure/container";

// Mock DTOs
jest.mock("../../dto/CreateUserDto", () => {
  return {
    CreateUserDto: function (data: Record<string, unknown>) {
      // Mock validation logic
      if (!data.email) throw new Error("Email is required");
      return { email: data.email, ...data };
    },
  };
});
jest.mock("../../dto/UpdateUserDto", () => {
  return {
    UpdateUserDto: function (data: Record<string, unknown>) {
      // Mock basic validation similar to CreateUserDto
      return { ...data };
    },
  };
});

function setupApp(): Express {
  const app = express();
  app.use(express.json());
  const controller = new UserController();
  app.post("/users", controller.createUser.bind(controller));
  app.get("/users/:id", controller.getUserById.bind(controller));
  app.get("/users", controller.getUserByEmail.bind(controller));
  app.put("/users/:id", controller.updateUser.bind(controller));
  app.delete("/users/:id", controller.deleteUser.bind(controller));
  return app;
}

const setupMockRepository = (methods: Partial<Record<string, unknown>>) => {
  const mockRepo = container[USER_REPOSITORY] as any;
  Object.assign(mockRepo, methods);
};

describe("UserController Integration Tests", () => {
  let app: Express;

  beforeEach(() => {
    app = setupApp();
    jest.clearAllMocks();
  });

  describe("POST /users", () => {
    it("should create a user and return 201", async () => {
      const mockUser = { 
        id: "1", 
        email: "test@example.com",
        name: "Test User",
        lastName: "Test",
        wallet: "GABCDEF123456789",
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setupMockRepository({
        create: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post("/users")
        .send({ 
          email: "test@example.com",
          name: "Test User",
          lastName: "Test",
          password: "password123",
          wallet: "GABCDEF123456789"
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockUser);
    });

    it("should handle conflict errors and return 409", async () => {
      setupMockRepository({
        create: jest.fn().mockRejectedValue(new Error("A user with this email or wallet already exists")),
      });

      const res = await request(app)
        .post("/users")
        .send({ 
          email: "test@example.com",
          name: "Test User",
          lastName: "Test",
          password: "password123",
          wallet: "GABCDEF123456789"
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("already exists");
    });

    it("should handle validation errors and return 400", async () => {
      setupMockRepository({
        create: jest.fn().mockRejectedValue(new Error("Validation error")),
      });

      const res = await request(app)
        .post("/users")
        .send({ 
          email: "test@example.com",
          name: "Test User",
          lastName: "Test",
          password: "password123",
          wallet: "GABCDEF123456789"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("validation");
    });
  });

  describe("GET /users/:id", () => {
    it("should return a user by id", async () => {
      const mockUser = { 
        id: "1", 
        email: "test@example.com",
        name: "Test User",
        lastName: "Test",
        wallet: "GABCDEF123456789",
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setupMockRepository({
        findById: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app).get("/users/1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
    });

    it("should return 404 if user not found", async () => {
      setupMockRepository({
        findById: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get("/users/1");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });

    it("should handle errors and return 500", async () => {
      setupMockRepository({
        findById: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      const res = await request(app).get("/users/1");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Internal server error");
    });
  });

  describe("GET /users?email=", () => {
    it("should return a user by email", async () => {
      const mockUser = { 
        id: "1", 
        email: "test@example.com",
        name: "Test User",
        lastName: "Test",
        wallet: "GABCDEF123456789",
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setupMockRepository({
        findByEmail: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app).get("/users?email=test@example.com");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
    });

    it("should return 400 if email is missing", async () => {
      const res = await request(app).get("/users");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email is required");
    });

    it("should return 404 if user not found", async () => {
      setupMockRepository({
        findByEmail: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get("/users?email=test@example.com");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });
  });

  describe("PUT /users/:id", () => {
    it("should update a user and return 200", async () => {
      const mockUpdatedUser = { 
        id: "1", 
        email: "test@example.com",
        name: "Updated User",
        lastName: "Updated",
        wallet: "GABCDEF123456789",
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setupMockRepository({
        update: jest.fn().mockResolvedValue(mockUpdatedUser),
      });

      const res = await request(app).put("/users/1").send({ name: "Updated User" });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User updated successfully");
      expect(res.body.user).toEqual(mockUpdatedUser);
    });

    it("should handle not found errors and return 404", async () => {
      setupMockRepository({
        update: jest.fn().mockRejectedValue(new Error("User not found")),
      });

      const res = await request(app).put("/users/1").send({ name: "Updated" });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });

    it("should handle conflict errors and return 409", async () => {
      setupMockRepository({
        update: jest.fn().mockRejectedValue(new Error("A user with this email already exists")),
      });

      const res = await request(app).put("/users/1").send({ email: "conflict@example.com" });
      expect(res.status).toBe(409);
      expect(res.body.error).toBe("A user with this email already exists");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete a user and return 200", async () => {
      setupMockRepository({
        delete: jest.fn().mockResolvedValue(undefined),
      });

      const res = await request(app).delete("/users/1");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User deleted successfully");
    });

    it("should handle not found errors and return 404", async () => {
      setupMockRepository({
        delete: jest.fn().mockRejectedValue(new Error("User not found")),
      });

      const res = await request(app).delete("/users/1");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });
  });
});
