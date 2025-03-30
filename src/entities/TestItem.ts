import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class TestItem extends BaseEntity {
  @Column()
  name: string;

  @Column()
  value: number;

  @Column()
  age: number;
}
