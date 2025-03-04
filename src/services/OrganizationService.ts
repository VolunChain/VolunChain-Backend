import { PrismaClient, Organization, NFT } from "@prisma/client";
import { ValidationError } from "../errors";

type OrganizationWithNFTs = Organization & {
  nfts: NFT[];
};

type OrganizationUpdateData = Partial<
  Omit<Organization, "id" | "createdAt" | "updatedAt">
>;

class OrganizationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createOrganization(
    name: string,
    email: string,
    password: string,
    category: string,
    wallet: string
  ): Promise<OrganizationWithNFTs> {
    // Check if organization with email already exists
    const existingOrgEmail = await this.prisma.organization.findUnique({
      where: { email },
    });
    if (existingOrgEmail) {
      throw new ValidationError("Organization with this email already exists");
    }

    // Check if organization with wallet already exists
    const existingOrgWallet = await this.prisma.organization.findUnique({
      where: { wallet },
    });
    if (existingOrgWallet) {
      throw new ValidationError("Organization with this wallet already exists");
    }

    return this.prisma.organization.create({
      data: {
        name,
        email,
        password, // Note: In a real application, this should be hashed
        category,
        wallet,
      },
      include: {
        nfts: true,
      },
    });
  }

  async getOrganizationById(id: string): Promise<OrganizationWithNFTs | null> {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        nfts: true,
      },
    });
  }

  async getOrganizationByEmail(
    email: string
  ): Promise<OrganizationWithNFTs | null> {
    return this.prisma.organization.findUnique({
      where: { email },
      include: {
        nfts: true,
      },
    });
  }

  async updateOrganization(
    id: string,
    updateData: OrganizationUpdateData
  ): Promise<OrganizationWithNFTs> {
    const organization = await this.getOrganizationById(id);
    if (!organization) {
      throw new ValidationError("Organization not found");
    }

    // If email is being updated, check for uniqueness
    if (updateData.email && updateData.email !== organization.email) {
      const existingOrgEmail = await this.prisma.organization.findUnique({
        where: { email: updateData.email },
      });
      if (existingOrgEmail) {
        throw new ValidationError(
          "Organization with this email already exists"
        );
      }
    }

    // If wallet is being updated, check for uniqueness
    if (updateData.wallet && updateData.wallet !== organization.wallet) {
      const existingOrgWallet = await this.prisma.organization.findUnique({
        where: { wallet: updateData.wallet },
      });
      if (existingOrgWallet) {
        throw new ValidationError(
          "Organization with this wallet already exists"
        );
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: updateData,
      include: {
        nfts: true,
      },
    });
  }

  async deleteOrganization(id: string): Promise<void> {
    const organization = await this.getOrganizationById(id);
    if (!organization) {
      throw new ValidationError("Organization not found");
    }

    await this.prisma.organization.delete({
      where: { id },
    });
  }

  async getAllOrganizations(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ organizations: OrganizationWithNFTs[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        skip,
        take: pageSize,
        include: {
          nfts: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.organization.count(),
    ]);

    return { organizations, total };
  }
}

export default OrganizationService;
