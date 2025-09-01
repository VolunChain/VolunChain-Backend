import { Request, Response } from "express";
import { AuthModuleFactory } from "../../factories/auth.factory";

describe("AuthController Integration", () => {
  let authUseCases: ReturnType<typeof AuthModuleFactory.createAuthController>;
  
  beforeEach(() => {
    authUseCases = AuthModuleFactory.createAuthController();
  });

  it("should create auth use cases with all required dependencies", () => {
    expect(authUseCases.sendVerificationEmailUseCase).toBeDefined();
    expect(authUseCases.resendVerificationEmailUseCase).toBeDefined();
    expect(authUseCases.verifyEmailUseCase).toBeDefined();
    expect(authUseCases.validateWalletFormatUseCase).toBeDefined();
    expect(authUseCases.verifyWalletUseCase).toBeDefined();
  });

  test("should return error if required fields are missing on register", async () => {
    const req = { body: {} } as Partial<Request>;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
    
    // Import the controller functions directly since they use the factory
    const { register } = await import("../../presentation/controllers/Auth.controller");
    await register(req as Request, res as Response);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});
