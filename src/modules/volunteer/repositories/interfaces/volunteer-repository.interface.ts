import { Volunteer } from "../../domain/entities/volunteer.entity";

export interface IVolunteerRepository {
  create(volunteer: Volunteer): Promise<Volunteer>;
  findById(id: string): Promise<Volunteer | null>;
  findByProjectId(
    projectId: string,
    page?: number,
    pageSize?: number
  ): Promise<Volunteer[]>;
  update(volunteer: Volunteer): Promise<Volunteer>;
  delete(id: string): Promise<void>;
  count(projectId: string): Promise<number>;
}
