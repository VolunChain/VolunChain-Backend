import { Repository } from "prisma";
import AppDataSource from "../config/ormconfig";
import { Organization } from "../entities/Organization";
import { ValidationError } from "../errors";

class OrganizationService {
  private organizationRepo: Repository<Organization>;

  constructor() {
    this.organizationRepo = AppDataSource.getRepository(Organization);
  }

  async createOrganization(
    name: string,
    email: string,
    password: string,
    category: string,
    wallet: string
  ): Promise<Organization> {
    // Check if organization with email already exists
    const existingOrgEmail = await this.organizationRepo.findOne({
      where: { email },
    });
    if (existingOrgEmail) {
      throw new ValidationError("Organization with this email already exists");
    }

    // Check if organization with wallet already exists
    const existingOrgWallet = await this.organizationRepo.findOne({
      where: { wallet },
    });
    if (existingOrgWallet) {
      throw new ValidationError("Organization with this wallet already exists");
    }

    const organization = this.organizationRepo.create({
      name,
      email,
      password, // Note: In a real application, this should be hashed
      category,
      wallet,
    });

    return this.organizationRepo.save(organization);
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return this.organizationRepo.findOne({
      where: { id },
      relations: ["projects"],
    });
  }

  async getOrganizationByEmail(email: string): Promise<Organization | null> {
    return this.organizationRepo.findOne({
      where: { email },
      relations: ["projects"],
    });
  }

  async updateOrganization(
    id: string,
    updateData: Partial<Organization>
  ): Promise<Organization> {
    const organization = await this.getOrganizationById(id);
    if (!organization) {
      throw new ValidationError("Organization not found");
    }

    // If email is being updated, check for uniqueness
    if (updateData.email && updateData.email !== organization.email) {
      const existingOrgEmail = await this.organizationRepo.findOne({
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
      const existingOrgWallet = await this.organizationRepo.findOne({
        where: { wallet: updateData.wallet },
      });
      if (existingOrgWallet) {
        throw new ValidationError(
          "Organization with this wallet already exists"
        );
      }
    }

    Object.assign(organization, updateData);
    return this.organizationRepo.save(organization);
  }

  async deleteOrganization(id: string): Promise<void> {
    const organization = await this.getOrganizationById(id);
    if (!organization) {
      throw new ValidationError("Organization not found");
    }

    await this.organizationRepo.remove(organization);
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return this.organizationRepo.find({
      relations: ["projects"],
    });
  }
}

export default OrganizationService;
