import { HorizonWalletRepository } from "./HorizonWalletRepository";

describe("HorizonWalletRepository", () => {
  it("should return true for a valid wallet", async () => {
    const repository = new HorizonWalletRepository();
    const result = await repository.verifyWallet("validPublicKey");
    expect(result).toBe(true);
  });

  it("should return false for an invalid wallet", async () => {
    const repository = new HorizonWalletRepository();
    const result = await repository.verifyWallet("invalidPublicKey");
    expect(result).toBe(false);
  });
});
