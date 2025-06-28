import { Entity, Column, OneToMany } from "typeorm"
import { BaseEntity } from "../../../shared/domain/entities/base.entity"
import { Volunteer } from "@/modules/volunteer/domain/entities/volunteer.entity"

export enum ProjectStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

@Entity("projects")
export class Project extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false })
  name: string

  @Column({ type: "text", nullable: false })
  description: string

  @Column({ type: "varchar", length: 255, nullable: false })
  location: string

  @Column({ type: "date", nullable: false })
  startDate: Date

  @Column({ type: "date", nullable: false })
  endDate: Date

  @Column({ type: "uuid", nullable: false })
  organizationId: string

  @Column({
    type: "enum",
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus

  @OneToMany(
    () => Volunteer,
    (volunteer) => volunteer.project,
  )
  volunteers?: Volunteer[]

  // Domain methods
  public activate(): void {
    if (this.status !== ProjectStatus.DRAFT) {
      throw new Error("Only draft projects can be activated")
    }
    this.status = ProjectStatus.ACTIVE
  }

  public complete(): void {
    if (this.status !== ProjectStatus.ACTIVE) {
      throw new Error("Only active projects can be completed")
    }
    this.status = ProjectStatus.COMPLETED
  }

  public cancel(): void {
    if (this.status === ProjectStatus.COMPLETED) {
      throw new Error("Completed projects cannot be cancelled")
    }
    this.status = ProjectStatus.CANCELLED
  }

  public isActive(): boolean {
    return this.status === ProjectStatus.ACTIVE
  }

  public isCompleted(): boolean {
    return this.status === ProjectStatus.COMPLETED
  }
}
