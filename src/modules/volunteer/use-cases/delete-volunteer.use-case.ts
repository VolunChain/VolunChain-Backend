import { IVolunteerRepository } from "../repositories/interfaces/volunteer-repository.interface";

export class DeleteVolunteerUseCase {
  constructor(private volunteerRepository: IVolunteerRepository) {}

  async execute(id: string): Promise<void> {
    // Check if volunteer exists before deleting
    const existingVolunteer = await this.volunteerRepository.findById(id);

    if (!existingVolunteer) {
      throw new Error("Volunteer not found");
    }

    // Delete the volunteer
    await this.volunteerRepository.delete(id);
  }
}
