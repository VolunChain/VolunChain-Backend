import { OrganizationEntity } from "../../domain/entities/organization.entity";

export interface IOrganizationRepository {
  save(organization: OrganizationEntity): Promise<OrganizationEntity>;
  findById(id: string): Promise<OrganizationEntity | null>;
  findByEmail(email: string): Promise<OrganizationEntity | null>;
  findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<OrganizationEntity[]>;
  findAll(
    page?: number,
    limit?: number,
    search?: string
  ): Promise<OrganizationEntity[]>;
  update(
    id: string,
    organization: OrganizationEntity
  ): Promise<OrganizationEntity>;
  delete(id: string): Promise<void>;
}
