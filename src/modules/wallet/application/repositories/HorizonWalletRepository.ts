/* eslint-disable @typescript-eslint/no-explicit-any */
import { Horizon, Networks } from "@stellar/stellar-sdk";
import { IWalletRepository } from "../../domain/interfaces/IWalletRepository";
import { WalletVerification } from "../../domain/entities/WalletVerification";
import { StellarAddress } from "../../domain/value-objects/StellarAddress";
import { horizonConfig } from "../../../../config/horizon.config";

export class HorizonWalletRepository implements IWalletRepository {
  private server: Horizon.Server;
  private networkPassphrase: string;

  constructor() {
    this.server = new Horizon.Server(horizonConfig.url, {
      allowHttp: horizonConfig.url.startsWith("http://"),
    });

    // Set network passphrase based on configuration
    this.networkPassphrase =
      horizonConfig.network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
  }

  async verifyWallet(address: StellarAddress): Promise<WalletVerification> {
    try {
      const accountDetails = await this.getAccountDetails(address);

      if (accountDetails) {
        // Account exists and is valid
        const balance = this.extractNativeBalance(accountDetails.balances);
        const sequence = accountDetails.sequence;

        return WalletVerification.createValid(
          address.value,
          true,
          balance,
          sequence
        );
      } else {
        // Account doesn't exist but address format is valid
        return WalletVerification.createValid(address.value, false, "0", "0");
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.response && error.response.status === 404) {
        // Account not found - this is valid, just means account doesn't exist yet
        return WalletVerification.createValid(address.value, false, "0", "0");
      }

      // Other errors indicate invalid wallet or network issues
      return WalletVerification.createInvalid(
        address.value,
        `Wallet verification failed: ${error.message}`
      );
    }
  }

  async accountExists(address: StellarAddress): Promise<boolean> {
    try {
      await this.server.accounts().accountId(address.value).call();
      return true;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async getAccountDetails(address: StellarAddress): Promise<any> {
    try {
      const account = await this.server
        .accounts()
        .accountId(address.value)
        .call();
      return account;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private extractNativeBalance(balances: any[]): string {
    const nativeBalance = balances.find(
      (balance) => balance.asset_type === "native"
    );
    return nativeBalance ? nativeBalance.balance : "0";
  }
}
