// Integration test for OrganizationController
import OrganizationController from "../../presentation/controllers/OrganizationController";
import request from "supertest";
import express, { Express } from "express";

// Mock the OrganizationService
jest.mock("../../../../services/OrganizationService");
import { OrganizationService } from "../../../../services/OrganizationService";

// Mock asyncHandler to just return the function (for test simplicity)
jest.mock("../../../../utils/asyncHandler", () => ({
  asyncHandler: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}));

function setupApp(): Express {
  const app = express();
  app.use(express.json());
  // OrganizationController is a singleton instance
  app.post("/organizations", OrganizationController.createOrganization);
  app.get("/organizations/:id", OrganizationController.getOrganizationById);
  app.get(
    "/organizations/email/:email",
    OrganizationController.getOrganizationByEmail
  );
  app.put("/organizations/:id", OrganizationController.updateOrganization);
  app.delete("/organizations/:id", OrganizationController.deleteOrganization);
  app.get("/organizations", OrganizationController.getAllOrganizations);
  return app;
}

describe("OrganizationController", () => {
  let app: Express;

  beforeEach(() => {
    app = setupApp();
    jest.clearAllMocks();
  });

  describe("POST /organizations", () => {
    it("should create an organization and return 201", async () => {
      const mockOrg = { id: "1", name: "Org" };
      (OrganizationService as jest.Mock).mockImplementation(() => ({
        createOrganization: jest.fn().mockResolvedValue(mockOrg),
      }));
      const res = await request(app).post("/organizations").send({
        name: "Org",
        email: "org@mail.com",
        password: "pass",
        category: "cat",
        wallet: "wallet",
      });
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockOrg);
    });
  });

  describe("GET /organizations/:id", () => {
    it("should return an organization by id", async () => {
      const mockOrg = { id: "1", name: "Org" };
      (OrganizationService as jest.Mock).mockImplementation(() => ({
        getOrganizationById: jest.fn().mockResolvedValue(mockOrg),
      }));
      const res = await request(app).get("/organizations/1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockOrg);
    });
    it("should return 404 if not found", async () => {
      (OrganizationService as jest.Mock).mockImplementation(() => ({
        getOrganizationById: jest.fn().mockResolvedValue(null),
      }));
      const res = await request(app).get("/organizations/1");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Organization not found");
    });
  });

  describe("GET /organizations/email/:email", () => {
    it("should return an organization by email", async () => {
      const mockOrg = { id: "1", name: "Org" };
      (OrganizationService as jest.Mock).mockImplementation(() => ({
        getOrganizationByEmail: jest.fn().mockResolvedValue(mockOrg),
      }));
      const res = await request(app).get("/organizations/email/test@mail.com");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockOrg);
    });
    it("should return 404 if not found", async () => {
      (OrganizationService as jest.Mock).mockImplementation(() => ({
        getOrganizationByEmail: jest.fn().mockResolvedValue(null),
      }));
      const res = await request(app).get("/organizations/email/test@mail.com");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Organization not found");
    });
  });

  describe("PUT /organizations/:id", () => {
    it("should update an organization and return 200", async () => {
      const mockOrg = { id: "1", name: "Updated Org" };
      (OrganizationService as jest.Mock).mockImplementation(() => ({
        updateOrganization: jest.fn().mockResolvedValue(mockOrg),
      }));
      const res = await request(app)
        .put("/organizations/1")
        .send({ name: "Updated Org" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockOrg);
    });
  });

  describe("DELETE /organizations/:id", () => {
    it("should delete an organization and return 204", async () => {
      (OrganizationService as jest.Mock).mockImplementation(() => ({
        deleteOrganization: jest.fn().mockResolvedValue(undefined),
      }));
      const res = await request(app).delete("/organizations/1");
      expect(res.status).toBe(204);
    });
  });

  describe("GET /organizations", () => {
    it("should return all organizations", async () => {
      const mockOrgs = [{ id: "1" }, { id: "2" }];
      (OrganizationService as jest.Mock).mockImplementation(() => ({
        getAllOrganizations: jest.fn().mockResolvedValue(mockOrgs),
      }));
      const res = await request(app).get("/organizations");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockOrgs);
    });
  });
});
