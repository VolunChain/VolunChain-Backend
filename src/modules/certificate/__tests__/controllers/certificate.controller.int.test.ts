// Integration test for certificate.controller
import { Request, Response } from "express";
import * as CertificateController from "../../presentation/controllers/certificate.controller";

describe("CertificateController Integration", () => {
  it("should have a downloadCertificate function", () => {
    expect(typeof CertificateController.downloadCertificate).toBe("function");
  });

  test("should return error if volunteer does not exist on downloadCertificate", async () => {
    const req = {
      params: { id: "nonexistent" },
      user: {
        id: "user1",
        email: "test@example.com",
        role: "volunteer",
        isVerified: true,
      },
      query: {},
    } as Partial<Request>;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
    await CertificateController.downloadCertificate(
      req as Request,
      res as Response
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
