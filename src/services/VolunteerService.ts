import { prisma } from "../config/prisma";

export default class VolunteerService {
  async createVolunteer(
    name: string,
    description: string,
    requirements: string,
    incentive: string,
    projectId: string
  ) {
    return prisma.volunteer.create({
      data: {
        name,
        description,
        requirements,
        incentive,
        projectId,
      },
      include: {
        project: true,
      },
    });
  }

  async getVolunteerById(id: string) {
    return prisma.volunteer.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
  }

  async getVolunteersByProjectId(
    projectId: string,
    page: number = 1,
    pageSize: number = 10
  ) {
    const skip = (page - 1) * pageSize;

    const [volunteers, total] = await Promise.all([
      prisma.volunteer.findMany({
        where: { projectId },
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          project: true,
        },
      }),
      prisma.volunteer.count({
        where: { projectId },
      }),
    ]);

    return { volunteers, total };
  }
}
