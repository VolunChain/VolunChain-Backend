import { PrismaClient } from "@prisma/client";
import { Volunteer } from "../../domain/entities/volunteer.entity";
import { IVolunteerRepository } from "../interfaces/volunteer-repository.interface";

export class VolunteerPrismaRepository implements IVolunteerRepository {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async create(volunteer: Volunteer): Promise<Volunteer> {
    const volunteerData = volunteer.toObject();
    const createdVolunteer = await this.prisma.volunteer.create({
      data: {
        name: volunteerData.name,
        description: volunteerData.description,
        requirements: volunteerData.requirements,
        incentive: volunteerData.incentive,
        projectId: volunteerData.projectId,
      },
    });

    return Volunteer.create({
      ...createdVolunteer,
      id: createdVolunteer.id,
    });
  }

  async findById(id: string): Promise<Volunteer | null> {
    const volunteerData = await this.prisma.volunteer.findUnique({
      where: { id },
    });

    return volunteerData
      ? Volunteer.create({
          ...volunteerData,
          id: volunteerData.id,
        })
      : null;
  }

  async findByProjectId(
    projectId: string,
    page = 1,
    pageSize = 10
  ): Promise<Volunteer[]> {
    const volunteers = await this.prisma.volunteer.findMany({
      where: { projectId },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return volunteers.map((v: any) =>
      Volunteer.create({
        ...v,
        id: v.id,
      })
    );
  }

  async update(volunteer: Volunteer): Promise<Volunteer> {
    const volunteerData = volunteer.toObject();
    const updatedVolunteer = await this.prisma.volunteer.update({
      where: { id: volunteerData.id },
      data: {
        name: volunteerData.name,
        description: volunteerData.description,
        requirements: volunteerData.requirements,
        incentive: volunteerData.incentive,
      },
    });

    return Volunteer.create({
      ...updatedVolunteer,
      id: updatedVolunteer.id,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.volunteer.delete({
      where: { id },
    });
  }

  async count(projectId: string): Promise<number> {
    return this.prisma.volunteer.count({
      where: { projectId },
    });
  }
}
