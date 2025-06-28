import { Entity, Column, JoinColumn, ManyToOne } from "typeorm"
import { BaseEntity } from "../../../shared/domain/entities/base.entity"
import { Project } from "../../../project/domain/entities/project.entity"

export interface VolunteerProps {
  name: string
  description: string
  requirements: string
  projectId: string
  incentive?: string
}

@Entity("volunteers")
export class Volunteer extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string

  @Column({ type: "varchar", length: 255, nullable: false })
  description!: string

  @Column({ type: "varchar", length: 255, nullable: false })
  requirements!: string

  @Column({ nullable: true })
  incentive?: string

  @Column({ type: "uuid", nullable: false })
  projectId!: string

  @ManyToOne(
    () => Project,
    (project) => project.volunteers,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: "projectId" })
  project!: Project

  // Domain methods
  public static create(props: VolunteerProps): Volunteer {
    const volunteer = new Volunteer()
    volunteer.validateProps(props)

    volunteer.name = props.name
    volunteer.description = props.description
    volunteer.requirements = props.requirements
    volunteer.projectId = props.projectId
    volunteer.incentive = props.incentive

    return volunteer
  }

  public update(props: Partial<VolunteerProps>): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error("Name is required")
      }
      this.name = props.name
    }

    if (props.description !== undefined) {
      if (!props.description.trim()) {
        throw new Error("Description is required")
      }
      this.description = props.description
    }

    if (props.requirements !== undefined) {
      if (!props.requirements.trim()) {
        throw new Error("Requirements are required")
      }
      this.requirements = props.requirements
    }

    if (props.incentive !== undefined) {
      this.incentive = props.incentive
    }
  }

  public toObject(): VolunteerProps & { id: string; createdAt: Date; updatedAt: Date } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      requirements: this.requirements,
      projectId: this.projectId,
      incentive: this.incentive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  private validateProps(props: VolunteerProps): void {
    if (!props.name || !props.name.trim()) {
      throw new Error("Name is required")
    }

    if (!props.description || !props.description.trim()) {
      throw new Error("Description is required")
    }

    if (!props.requirements || !props.requirements.trim()) {
      throw new Error("Requirements are required")
    }

    if (!props.projectId || !props.projectId.trim()) {
      throw new Error("Project ID is required")
    }
  }
}
