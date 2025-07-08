import { Entity, PrimaryColumn, CreateDateColumn } from "typeorm"
import { BaseEntity } from "../../../shared/domain/entities/base.entity"

@Entity("user_volunteers")
export class UserVolunteer extends BaseEntity {
  @PrimaryColumn("uuid")
  userId: string

  @PrimaryColumn("uuid")
  volunteerId: string

  @CreateDateColumn()
  joinedAt: Date

  // Domain methods
  public static create(userId: string, volunteerId: string): UserVolunteer {
    if (!userId || !volunteerId) {
      throw new Error("User ID and Volunteer ID are required")
    }

    const userVolunteer = new UserVolunteer()
    userVolunteer.userId = userId
    userVolunteer.volunteerId = volunteerId
    userVolunteer.joinedAt = new Date()

    return userVolunteer
  }

  public isUserAssigned(userId: string): boolean {
    return this.userId === userId
  }

  public isVolunteerAssigned(volunteerId: string): boolean {
    return this.volunteerId === volunteerId
  }
}
