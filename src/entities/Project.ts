import { Entity, Column, OneToMany} from 'prisma';
import { BaseEntity } from './BaseEntity';
import { Volunteer } from './Volunteer';

@Entity()
export class Project extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  location: string;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: false })
  endDate: Date;

  @OneToMany(() => Volunteer, (volunteer) => volunteer.project)
  volunteers!: Volunteer[];
}
