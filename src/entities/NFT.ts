import { Entity, Column, ManyToOne, JoinColumn } from 'prisma';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Organization } from './Organization';

@Entity()
export class NFT extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'text', nullable: false })
  description: string;
}