import { PrismaClient, Prisma } from "@prisma/client";
import {
  VolunteerAlreadyRegisteredError,
  VolunteerNotFoundError,
  VolunteerPositionFullError,
} from "../../../../modules/volunteer/application/errors";

export class UserVolunteerService {
  constructor(private prisma: PrismaClient) {}

  async addUserToVolunteer(userId: string, volunteerId: string) {
    return this.prisma.userVolunteer.create({
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
      this.prisma.userVolunteer.findMany({
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
      this.prisma.userVolunteer.count({
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
      this.prisma.userVolunteer.findMany({
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
      this.prisma.userVolunteer.count({
        where: { volunteerId },
      }),
    ]);

    return { userVolunteers, total };
  }

  private async validateVolunteerExists(
    volunteerId: string,
    tx: Prisma.TransactionClient
  ) {
    const volunteer = await tx.volunteer.findUnique({
      where: { id: volunteerId },
      include: {
        _count: {
          select: { userVolunteers: true },
        },
      },
    });

    if (!volunteer) {
      throw new VolunteerNotFoundError();
    }

    return volunteer;
  }

  private async validateNoDuplicateRegistration(
    userId: string,
    volunteerId: string,
    tx: Prisma.TransactionClient
  ) {
    const existingRegistration = await tx.userVolunteer.findUnique({
      where: {
        userId_volunteerId: {
          userId,
          volunteerId,
        },
      },
    });

    if (existingRegistration) {
      throw new VolunteerAlreadyRegisteredError();
    }
  }

  private validateVolunteerCapacity(volunteer: {
    _count: { userVolunteers: number };
    maxVolunteers: number;
  }) {
    if (volunteer._count.userVolunteers >= volunteer.maxVolunteers) {
      throw new VolunteerPositionFullError();
    }
  }

  async registerVolunteerSafely(userId: string, volunteerId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const volunteer = await this.validateVolunteerExists(volunteerId, tx);
        await this.validateNoDuplicateRegistration(userId, volunteerId, tx);
        this.validateVolunteerCapacity(volunteer);

        // Create the registration
        const registration = await tx.userVolunteer.create({
          data: {
            userId,
            volunteerId,
          },
          include: {
            user: true,
            volunteer: true,
          },
        });

        return registration;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 5000, // 5 second timeout
      }
    );
  }
}
