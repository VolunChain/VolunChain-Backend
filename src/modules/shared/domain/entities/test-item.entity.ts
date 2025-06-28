import { Entity, Column } from "typeorm"
import { BaseEntity } from "./base.entity"

@Entity("test_items")
export class TestItem extends BaseEntity {
  @Column()
  name: string

  @Column()
  value: number

  @Column()
  age: number

  // Domain methods
  public static create(name: string, value: number, age: number): TestItem {
    if (!name || name.trim() === "") {
      throw new Error("Name is required")
    }

    if (value < 0) {
      throw new Error("Value must be non-negative")
    }

    if (age < 0) {
      throw new Error("Age must be non-negative")
    }

    const testItem = new TestItem()
    testItem.name = name
    testItem.value = value
    testItem.age = age

    return testItem
  }

  public updateValue(newValue: number): void {
    if (newValue < 0) {
      throw new Error("Value must be non-negative")
    }
    this.value = newValue
  }

  public incrementAge(): void {
    this.age += 1
  }
}
