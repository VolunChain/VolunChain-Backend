import { Keypair, StrKey, Horizon } from "@stellar/stellar-sdk";
import { horizonConfig } from "../../../../config/horizon.config";
import { WalletDto } from "../../presentation/dto";

type WalletVerificationResult = {
  verified: boolean;
  walletAddress: string;
  error?: string;
};

export class VerifyWalletUseCase {
  async execute(input: WalletDto): Promise<WalletVerificationResult> {
    const { walletAddress, signature, message } = input;

    // Validate public key format
    if (!StrKey.isValidEd25519PublicKey(walletAddress)) {
      return {
        verified: false,
        walletAddress,
        error: "Invalid Stellar public key",
      };
    }

    // Check that account exists on Horizon network before signature verification
    try {
      const server = new Horizon.Server(horizonConfig.url, {
        allowHttp: horizonConfig.url.startsWith("http://"),
      });
      await server.accounts().accountId(walletAddress).call();
    } catch (err: unknown) {
      type HttpError = { response?: { status?: number } };
      const httpErr = err as HttpError;

      // If account not found on network, error
      if (httpErr.response?.status === 404) {
        return {
          verified: false,
          walletAddress,
          error: "Account not found on Stellar network",
        };
      }
      return {
        verified: false,
        walletAddress,
        error: err instanceof Error ? err.message : "Horizon query failed",
      };
    }

    // Decode signature (expect base64)
    let sig: Buffer;
    try {
      sig = Buffer.from(signature, "base64");
    } catch {
      return {
        verified: false,
        walletAddress,
        error: "Invalid signature encoding (base64)",
      };
    }
    if (!sig || sig.length === 0) {
      return { verified: false, walletAddress, error: "Empty signature" };
    }

    const data = Buffer.from(message, "utf8");
    const keypair = Keypair.fromPublicKey(walletAddress);

    try {
      const keypairVerification = keypair.verify(data, sig);
      return keypairVerification
        ? { verified: true, walletAddress }
        : {
            verified: false,
            walletAddress,
            error: "Signature verification failed",
          };
    } catch (err) {
      return {
        verified: false,
        walletAddress,
        error: err instanceof Error ? err.message : "Verification error",
      };
    }
  }
}
