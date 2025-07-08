import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm"

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column()
  lastName: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({ unique: true })
  wallet: string

  @Column({ default: false })
  isVerified: boolean

  @Column({ nullable: true })
  verificationToken: string

  @Column({ type: "timestamp", nullable: true })
  verificationTokenExpires: Date
}
