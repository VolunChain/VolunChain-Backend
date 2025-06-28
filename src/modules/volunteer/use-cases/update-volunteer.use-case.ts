import { Volunteer } from "../domain/entities/volunteer.entity";
import { IVolunteerRepository } from "../repositories/interfaces/volunteer-repository.interface";
import { UpdateVolunteerDTO } from "../dto/volunteer.dto";

export class UpdateVolunteerUseCase {
  constructor(private volunteerRepository: IVolunteerRepository) {}

  async execute(
    id: string,
    updateData: UpdateVolunteerDTO
  ): Promise<Volunteer> {
    // Fetch existing volunteer
    const existingVolunteer = await this.volunteerRepository.findById(id);

    // Throw error if volunteer not found
    if (!existingVolunteer) {
      throw new Error("Volunteer not found");
    }

    // Update the volunteer
    existingVolunteer.update(updateData);

    // Validate the updated volunteer
    existingVolunteer.validate();

    // Persist and return the updated volunteer
    return this.volunteerRepository.update(existingVolunteer);
  }
}
