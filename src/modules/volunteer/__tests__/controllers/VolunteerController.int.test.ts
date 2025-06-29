import request from "supertest";
import express, { Express } from "express";
import VolunteerController from "../../../../../src/modules/volunteer/presentation/controllers/VolunteerController";

// Mock the VolunteerService
jest.mock("../../../../src/services/VolunteerService");
import VolunteerService from "../../../../../src/services/VolunteerService";

function setupApp(): Express {
  const app = express();
  app.use(express.json());
  const controller = new VolunteerController();
  app.post("/volunteers", controller.createVolunteer.bind(controller));
  app.get("/volunteers/:id", controller.getVolunteerById.bind(controller));
  app.get(
    "/projects/:projectId/volunteers",
    controller.getVolunteersByProjectId.bind(controller)
  );
  return app;
}

describe("VolunteerController", () => {
  let app: Express;

  beforeEach(() => {
    app = setupApp();
    jest.clearAllMocks();
  });

  describe("POST /volunteers", () => {
    it("should create a volunteer and return 201", async () => {
      const mockVolunteer = { id: "1", name: "Test" };
      (VolunteerService as jest.Mock).mockImplementation(() => ({
        createVolunteer: jest.fn().mockResolvedValue(mockVolunteer),
      }));
      const res = await request(app).post("/volunteers").send({ name: "Test" });
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockVolunteer);
    });

    it("should handle errors and return 400", async () => {
      (VolunteerService as jest.Mock).mockImplementation(() => ({
        createVolunteer: jest.fn().mockRejectedValue(new Error("fail")),
      }));
      const res = await request(app).post("/volunteers").send({ name: "Test" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("fail");
    });
  });

  describe("GET /volunteers/:id", () => {
    it("should return a volunteer by id", async () => {
      const mockVolunteer = { id: "1", name: "Test" };
      (VolunteerService as jest.Mock).mockImplementation(() => ({
        getVolunteerById: jest.fn().mockResolvedValue(mockVolunteer),
      }));
      const res = await request(app).get("/volunteers/1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockVolunteer);
    });

    it("should return 404 if volunteer not found", async () => {
      (VolunteerService as jest.Mock).mockImplementation(() => ({
        getVolunteerById: jest.fn().mockResolvedValue(null),
      }));
      const res = await request(app).get("/volunteers/1");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Volunteer not found");
    });

    it("should handle errors and return 400", async () => {
      (VolunteerService as jest.Mock).mockImplementation(() => ({
        getVolunteerById: jest.fn().mockRejectedValue(new Error("fail")),
      }));
      const res = await request(app).get("/volunteers/1");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("fail");
    });
  });

  describe("GET /projects/:projectId/volunteers", () => {
    it("should return volunteers for a project", async () => {
      const mockVolunteers = [{ id: "1" }, { id: "2" }];
      (VolunteerService as jest.Mock).mockImplementation(() => ({
        getVolunteersByProjectId: jest.fn().mockResolvedValue(mockVolunteers),
      }));
      const res = await request(app).get("/projects/123/volunteers");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockVolunteers);
    });

    it("should handle errors and return 400", async () => {
      (VolunteerService as jest.Mock).mockImplementation(() => ({
        getVolunteersByProjectId: jest
          .fn()
          .mockRejectedValue(new Error("fail")),
      }));
      const res = await request(app).get("/projects/123/volunteers");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("fail");
    });
  });
});
