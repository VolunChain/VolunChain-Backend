import { Request, Response } from "express";
import NFTController from "../../presentation/controllers/NFTController";

describe("NFTController Integration", () => {
  it("should have a createNFT method", () => {
    expect(typeof NFTController.createNFT).toBe("function");
  });

  test("should return error if createNFT is called with empty body", async () => {
    const req = { body: {} } as Partial<Request>;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    await NFTController.createNFT(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
