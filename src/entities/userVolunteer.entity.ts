import { Entity, PrimaryColumn, CreateDateColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class UserVolunteer extends BaseEntity {
  @PrimaryColumn("uuid")
  userId: string; // Simple reference field for now

  @PrimaryColumn("uuid")
  volunteerId: string; // Simple reference field for now

  @CreateDateColumn()
  joinedAt: Date;
}
