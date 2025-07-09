// Integration test for ProjectController
import { Request, Response } from "express";
import ProjectController from "../../presentation/controllers/Project.controller";

describe("ProjectController Integration", () => {
  const controller = new ProjectController();

  it("should have a createProject method", () => {
    expect(typeof ProjectController.prototype.createProject).toBe("function");
  });

  test("should return error if required fields are missing on createProject", async () => {
    const req = { body: {} } as Partial<Request>;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
    await controller.createProject(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
