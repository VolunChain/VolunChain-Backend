import { VerifyWalletUseCase } from "./VerifyWalletUseCase";
import { HorizonWalletRepository } from "../repositories/HorizonWalletRepository";

describe("VerifyWalletUseCase", () => {
  it("should verify a valid wallet", async () => {
    const repository = new HorizonWalletRepository();
    const useCase = new VerifyWalletUseCase(repository);

    const result = await useCase.execute({
      publicKey: "validPublicKey",
      userId: "testUserId",
    });
    expect(result).toBe(true);
  });

  it("should throw an error for an invalid wallet", async () => {
    const repository = new HorizonWalletRepository();
    const useCase = new VerifyWalletUseCase(repository);

    const result = await useCase.execute({
      publicKey: "invalidPublicKey",
      userId: "testUserId",
    });
    expect(result).toBe(false);
  });
});
