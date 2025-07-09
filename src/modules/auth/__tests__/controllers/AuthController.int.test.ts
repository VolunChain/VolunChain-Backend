import { Request, Response } from "express";
// Integration test for AuthController
import AuthController from "../../presentation/controllers/Auth.controller";

describe("AuthController Integration", () => {
  it("should have a register method", () => {
    expect(typeof AuthController.register).toBe("function");
  });

  test("should return error if required fields are missing on register", async () => {
    const req = { body: {} } as Partial<Request>;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
    await AuthController.register(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});
