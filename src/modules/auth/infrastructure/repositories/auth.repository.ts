import { PrismaClient } from "@prisma/client";
import {
  IUser,
  IOrganization,
  IProfile,
} from "../../domain/interfaces/auth.interface";
import { WalletValidationService } from "../../domain/services/wallet-validation.service";

export class AuthRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Finds a user by wallet address
   * @param walletAddress - The wallet address to search for
   * @returns User object or null
   */
  async findUserByWallet(walletAddress: string): Promise<IUser | null> {
    try {
      const normalizedAddress =
        WalletValidationService.normalizeWalletAddress(walletAddress);

      const user = await this.prisma.user.findUnique({
        where: { wallet: normalizedAddress },
      });

      return user;
    } catch (error) {
      console.error("Error finding user by wallet:", error);
      return null;
    }
  }

  /**
   * Finds an organization by wallet address
   * @param walletAddress - The wallet address to search for
   * @returns Organization object or null
   */
  async findOrganizationByWallet(
    walletAddress: string
  ): Promise<IOrganization | null> {
    try {
      const normalizedAddress =
        WalletValidationService.normalizeWalletAddress(walletAddress);

      const organization = await this.prisma.organization.findUnique({
        where: { wallet: normalizedAddress },
      });

      return organization;
    } catch (error) {
      console.error("Error finding organization by wallet:", error);
      return null;
    }
  }

  /**
   * Finds any profile (user or organization) by wallet address
   * @param walletAddress - The wallet address to search for
   * @returns Profile object or null
   */
  async findProfileByWallet(walletAddress: string): Promise<IProfile | null> {
    try {
      const normalizedAddress =
        WalletValidationService.normalizeWalletAddress(walletAddress);

      // Try to find user first
      const user = await this.findUserByWallet(normalizedAddress);
      if (user) {
        return {
          name: user.name,
          email: user.email,
          wallet: user.wallet,
          profileType: "user" as const,
        };
      }

      // Try to find organization
      const organization =
        await this.findOrganizationByWallet(normalizedAddress);
      if (organization) {
        return {
          name: organization.name,
          email: organization.email,
          wallet: organization.wallet,
          profileType: "organization" as const,
          category: organization.category,
        };
      }

      return null;
    } catch (error) {
      console.error("Error finding profile by wallet:", error);
      return null;
    }
  }

  /**
   * Checks if a wallet address is already registered
   * @param walletAddress - The wallet address to check
   * @returns boolean indicating if wallet is registered
   */
  async isWalletRegistered(walletAddress: string): Promise<boolean> {
    try {
      const normalizedAddress =
        WalletValidationService.normalizeWalletAddress(walletAddress);

      const [user, organization] = await Promise.all([
        this.prisma.user.findUnique({ where: { wallet: normalizedAddress } }),
        this.prisma.organization.findUnique({
          where: { wallet: normalizedAddress },
        }),
      ]);

      return !!(user || organization);
    } catch (error) {
      console.error("Error checking wallet registration:", error);
      return false;
    }
  }

  /**
   * Checks if an email is already registered
   * @param email - The email to check
   * @returns boolean indicating if email is registered
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const [user, organization] = await Promise.all([
        this.prisma.user.findUnique({ where: { email: normalizedEmail } }),
        this.prisma.organization.findUnique({
          where: { email: normalizedEmail },
        }),
      ]);

      return !!(user || organization);
    } catch (error) {
      console.error("Error checking email registration:", error);
      return false;
    }
  }

  /**
   * Creates a new user
   * @param userData - User data to create
   * @returns Created user object
   */
  async createUser(userData: {
    name: string;
    lastName?: string;
    email: string;
    wallet: string;
  }): Promise<IUser> {
    try {
      const normalizedWallet = WalletValidationService.normalizeWalletAddress(
        userData.wallet
      );
      const normalizedEmail = userData.email.toLowerCase().trim();

      const user = await this.prisma.user.create({
        data: {
          name: userData.name,
          lastName: userData.lastName || "",
          email: normalizedEmail,
          wallet: normalizedWallet,
          isVerified: true, // Auto-verified for wallet-based auth
        },
      });

      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error(
        `Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Creates a new organization
   * @param organizationData - Organization data to create
   * @returns Created organization object
   */
  async createOrganization(organizationData: {
    name: string;
    email: string;
    wallet: string;
    category: string;
  }): Promise<IOrganization> {
    try {
      const normalizedWallet = WalletValidationService.normalizeWalletAddress(
        organizationData.wallet
      );
      const normalizedEmail = organizationData.email.toLowerCase().trim();

      const organization = await this.prisma.organization.create({
        data: {
          name: organizationData.name,
          email: normalizedEmail,
          wallet: normalizedWallet,
          category: organizationData.category,
        },
      });

      return organization;
    } catch (error) {
      console.error("Error creating organization:", error);
      throw new Error(
        `Failed to create organization: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Updates user verification status
   * @param userId - User ID to update
   * @param isVerified - New verification status
   * @returns Updated user object
   */
  async updateUserVerification(
    userId: string,
    isVerified: boolean
  ): Promise<IUser> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { isVerified },
      });

      return user;
    } catch (error) {
      console.error("Error updating user verification:", error);
      throw new Error(
        `Failed to update user verification: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Disconnects from the database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
