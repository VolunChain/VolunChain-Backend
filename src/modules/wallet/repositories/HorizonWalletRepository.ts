import { PrismaClient } from "@prisma/client";
import { IWalletRepository } from "./IWalletRepository";
import { Wallet } from "../domain/Wallet";

const prisma = new PrismaClient();

export class HorizonWalletRepository implements IWalletRepository {
  async findById(id: string): Promise<Wallet | null> {
    // Find a wallet by its ID using Prisma
    const wallet = await prisma.wallet.findUnique({
      where: { id },
    });
    return wallet
      ? new Wallet(
          wallet.id,
          wallet.publicKey,
          wallet.userId,
          wallet.isVerified
        )
      : null;
  }

  async findByPublicKey(publicKey: string): Promise<Wallet | null> {
    // Find a wallet by its public key using Prisma
    const wallet = await prisma.wallet.findUnique({
      where: { publicKey },
    });
    return wallet
      ? new Wallet(
          wallet.id,
          wallet.publicKey,
          wallet.userId,
          wallet.isVerified
        )
      : null;
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    // Find wallets associated with a specific user ID using Prisma
    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });
    return wallet
      ? new Wallet(
          wallet.id,
          wallet.publicKey,
          wallet.userId,
          wallet.isVerified
        )
      : null;
  }

  async save(wallet: Wallet): Promise<Wallet> {
    // Save a new wallet to the database using Prisma
    const savedWallet = await prisma.wallet.create({
      data: {
        id: wallet.id,
        publicKey: wallet.publicKey,
        userId: wallet.userId,
        isVerified: wallet.isVerified,
      },
    });
    return new Wallet(
      savedWallet.id,
      savedWallet.publicKey,
      savedWallet.userId,
      savedWallet.isVerified
    );
  }

  async update(wallet: Wallet): Promise<Wallet> {
    // Update an existing wallet in the database using Prisma
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        publicKey: wallet.publicKey,
        userId: wallet.userId,
        isVerified: wallet.isVerified,
      },
    });
    return new Wallet(
      updatedWallet.id,
      updatedWallet.publicKey,
      updatedWallet.userId,
      updatedWallet.isVerified
    );
  }

  async delete(id: string): Promise<void> {
    // Delete a wallet by its ID using Prisma
    await prisma.wallet.delete({
      where: { id },
    });
  }

  async verifyWallet(publicKey: string): Promise<boolean> {
    try {
      // Call the Stellar Horizon API to verify the wallet
      const response = await fetch(
        `https://horizon.stellar.org/accounts/${publicKey}`
      );
      if (!response.ok) {
        return false; // Wallet not found in the Stellar network
      }
      const data = await response.json();
      return !!data.account_id; // Check if the account ID exists
    } catch (error) {
      console.error("Error verifying wallet:", error);
      return false; // Return false if there is a network or API error
    }
  }
}

describe("ImportedHorizonWalletRepository", () => {
  const repository = new HorizonWalletRepository();

  it("should save and retrieve a wallet", async () => {
    const wallet = new Wallet(
      "test-id",
      "test-public-key",
      "test-user-id",
      false
    );
    await repository.save(wallet);

    const retrievedWallet = await repository.findById("test-id");
    expect(retrievedWallet).not.toBeNull();
    expect(retrievedWallet?.publicKey).toBe("test-public-key");
  });

  it("should delete a wallet", async () => {
    const wallet = new Wallet(
      "delete-id",
      "delete-public-key",
      "delete-user-id",
      false
    );
    await repository.save(wallet);

    await repository.delete("delete-id");
    const deletedWallet = await repository.findById("delete-id");
    expect(deletedWallet).toBeNull();
  });
});
