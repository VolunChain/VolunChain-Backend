import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Project } from "./Project";

@Entity()
export class Volunteer extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  description!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  requirements!: string;

  @Column({ nullable: true })
  incentive?: string;

  @ManyToOne(() => Project, (project) => project.volunteers, {
    nullable: false,
  })
  @JoinColumn({ name: "projectId" })
  project!: Project;
}
