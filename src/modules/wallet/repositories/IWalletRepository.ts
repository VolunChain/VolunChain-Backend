import { Wallet } from "../domain/Wallet";

export interface IWalletRepository {
  findById(id: string): Promise<Wallet | null>;
  findByPublicKey(publicKey: string): Promise<Wallet | null>;
  findByUserId(userId: string): Promise<Wallet | null>;
  save(wallet: Wallet): Promise<Wallet>;
  update(wallet: Wallet): Promise<Wallet>;
  delete(id: string): Promise<void>;
  verifyWallet(publicKey: string): Promise<boolean>;
}
