import { CertificateService } from "../../modules/certificate/application/services/CertificateService";
import { ICertificateService } from "../../modules/certificate/domain/interfaces/ICertificateService";
import { IUserRepository } from "../../modules/user/domain/interfaces/IUserRepository";
import { UserPrismaRepository } from "../../modules/user/infrastructure/repositories/implementations/user-prisma.repository";
import { prisma } from "../../config/prisma";

// Repository tokens
export const USER_REPOSITORY = Symbol.for("USER_REPOSITORY");

export const container = {
  certificateService: new CertificateService() as ICertificateService,
  [USER_REPOSITORY]: new UserPrismaRepository(prisma) as IUserRepository,
};
