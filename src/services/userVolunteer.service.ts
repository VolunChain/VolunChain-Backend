import { Repository } from 'prisma';
import AppDataSource from '../config/ormconfig';
import { UserVolunteer } from '../entities/userVolunteer.entity';

class UserVolunteerService {
  private userVolunteerRepo: Repository<UserVolunteer>;

  constructor() {
    this.userVolunteerRepo = AppDataSource.getRepository(UserVolunteer);
  }

  async addUserToVolunteer(userId: string, volunteerId: string): Promise<UserVolunteer> {
    const userVolunteer = this.userVolunteerRepo.create({ userId, volunteerId });
    return this.userVolunteerRepo.save(userVolunteer);
  }

  async getVolunteersByUserId(userId: string): Promise<UserVolunteer[]> {
    return this.userVolunteerRepo.find({ where: { userId }, relations: ['volunteer'] });
  }

  async getUsersByVolunteerId(volunteerId: string): Promise<UserVolunteer[]> {
    return this.userVolunteerRepo.find({ where: { volunteerId }, relations: ['user'] });
  }
}

export default UserVolunteerService;