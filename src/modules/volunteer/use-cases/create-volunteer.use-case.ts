import { Volunteer } from "../domain/entities/volunteer.entity";
import { IVolunteerRepository } from "../repositories/interfaces/volunteer-repository.interface";
import { CreateVolunteerDTO } from "../dto/volunteer.dto";

export class CreateVolunteerUseCase {
  constructor(private volunteerRepository: IVolunteerRepository) {}

  async execute(data: CreateVolunteerDTO): Promise<Volunteer> {
    // Additional business logic can be added here
    const volunteer = Volunteer.create(data);
    return this.volunteerRepository.create(volunteer);
  }
}
