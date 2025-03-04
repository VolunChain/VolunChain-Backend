import { prisma } from "../config/prisma";

class UserVolunteerService {
  async addUserToVolunteer(userId: string, volunteerId: string) {
    return prisma.userVolunteer.create({
      data: {
        userId,
        volunteerId,
      },
      include: {
        user: true,
        volunteer: true,
      },
    });
  }

  async getVolunteersByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ) {
    const skip = (page - 1) * pageSize;

    const [userVolunteers, total] = await Promise.all([
      prisma.userVolunteer.findMany({
        where: { userId },
        include: {
          volunteer: true,
        },
        skip,
        take: pageSize,
        orderBy: {
          joinedAt: "desc",
        },
      }),
      prisma.userVolunteer.count({
        where: { userId },
      }),
    ]);

    return { userVolunteers, total };
  }

  async getUsersByVolunteerId(
    volunteerId: string,
    page: number = 1,
    pageSize: number = 10
  ) {
    const skip = (page - 1) * pageSize;

    const [userVolunteers, total] = await Promise.all([
      prisma.userVolunteer.findMany({
        where: { volunteerId },
        include: {
          user: true,
        },
        skip,
        take: pageSize,
        orderBy: {
          joinedAt: "desc",
        },
      }),
      prisma.userVolunteer.count({
        where: { volunteerId },
      }),
    ]);

    return { userVolunteers, total };
  }
}

export default UserVolunteerService;
