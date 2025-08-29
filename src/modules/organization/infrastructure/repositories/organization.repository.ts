import { PrismaClient } from "@prisma/client";
import { IOrganizationRepository } from "../../application/repository/organization.repository";
import { OrganizationEntity } from "../../domain/entities/organization.entity";

export class OrganizationRepository implements IOrganizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(organization: OrganizationEntity): Promise<OrganizationEntity> {
    const savedOrg = await this.prisma.organization.upsert({
      where: { id: organization.id },
      update: {
        name: organization.name,
        email: organization.email,
        description: organization.description,
        category: organization.category,
        website: organization.website,
        address: organization.address,
        phone: organization.phone,
        isVerified: organization.isVerified,
        updatedAt: new Date(),
      },
      create: {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        description: organization.description,
        category: organization.category,
        website: organization.website,
        address: organization.address,
        phone: organization.phone,
        isVerified: organization.isVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return OrganizationEntity.create({
      name: savedOrg.name,
      email: savedOrg.email,
      description: savedOrg.description,
      category: savedOrg.category,
      website: savedOrg.website,
      address: savedOrg.address,
      phone: savedOrg.phone,
      isVerified: savedOrg.isVerified,
    });
  }

  async findById(id: string): Promise<OrganizationEntity | null> {
    const org = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!org) return null;

    return OrganizationEntity.create({
      name: org.name,
      email: org.email,
      description: org.description,
      category: org.category,
      website: org.website,
      address: org.address,
      phone: org.phone,
      isVerified: org.isVerified,
    });
  }

  async findByEmail(email: string): Promise<OrganizationEntity | null> {
    const org = await this.prisma.organization.findUnique({
      where: { email },
    });

    if (!org) return null;

    return OrganizationEntity.create({
      name: org.name,
      email: org.email,
      description: org.description,
      category: org.category,
      website: org.website,
      address: org.address,
      phone: org.phone,
      isVerified: org.isVerified,
    });
  }

  // Polimorfismo: Dos implementaciones de findAll
  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<OrganizationEntity[]>;
  async findAll(
    page?: number,
    limit?: number,
    search?: string
  ): Promise<OrganizationEntity[]>;
  async findAll(
    pageOrOptions?: number | { page?: number; limit?: number; search?: string },
    limit?: number,
    search?: string
  ): Promise<OrganizationEntity[]> {
    // Determinar qué versión del método se está llamando
    if (typeof pageOrOptions === "object") {
      // Llamada con objeto: findAll({ page: 1, limit: 10, search: "test" })
      const {
        page = 1,
        limit: limitParam = 10,
        search: searchParam,
      } = pageOrOptions;
      return this._findAllInternal(page, limitParam, searchParam);
    } else {
      // Llamada con parámetros separados: findAll(1, 10, "test")
      const page = pageOrOptions || 1;
      const limitParam = limit || 10;
      const searchParam = search;
      return this._findAllInternal(page, limitParam, searchParam);
    }
  }

  // Método privado que contiene la lógica común
  private async _findAllInternal(
    page: number,
    limit: number,
    search?: string
  ): Promise<OrganizationEntity[]> {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const orgs = await this.prisma.organization.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return orgs.map((org: (typeof orgs)[0]) =>
      OrganizationEntity.create({
        name: org.name,
        email: org.email,
        description: org.description,
        category: org.category,
        website: org.website,
        address: org.address,
        phone: org.phone,
        isVerified: org.isVerified,
      })
    );
  }

  async update(
    id: string,
    organization: OrganizationEntity
  ): Promise<OrganizationEntity> {
    const updatedOrg = await this.prisma.organization.update({
      where: { id },
      data: {
        name: organization.name,
        email: organization.email,
        description: organization.description,
        category: organization.category,
        website: organization.website,
        address: organization.address,
        phone: organization.phone,
        isVerified: organization.isVerified,
        updatedAt: new Date(),
      },
    });

    return OrganizationEntity.create({
      name: updatedOrg.name,
      email: updatedOrg.email,
      description: updatedOrg.description,
      category: updatedOrg.category,
      website: updatedOrg.website,
      address: updatedOrg.address,
      phone: updatedOrg.phone,
      isVerified: updatedOrg.isVerified,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({
      where: { id },
    });
  }

  async count(search?: string): Promise<number> {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    return this.prisma.organization.count({ where });
  }
}
