import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

/**
 * Photo entity representing images uploaded by users in the system
 */
@Entity("photos")
export class Photo {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  url: string;

  @Column({ type: "uuid", nullable: false })
  userId: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column({ type: "jsonb", nullable: true, default: {} })
  metadata: Record<string, any>;

  /**
   * Creates a new Photo instance
   * @param props Photo properties
   */
  constructor(props?: Partial<Photo>) {
    if (props) {
      Object.assign(this, props);
    }
  }

  /**
   * Validates that the Photo entity has all required fields
   * @returns true if valid, throws error otherwise
   */
  validate(): boolean {
    if (!this.url) {
      throw new Error("Photo URL is required");
    }

    if (
      !this.url.match(
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
      )
    ) {
      throw new Error("Photo URL is invalid");
    }

    if (!this.userId) {
      throw new Error("User ID is required");
    }

    return true;
  }

  /**
   * Updates the metadata of the photo
   * @param newMetadata The metadata to merge with existing metadata
   */
  updateMetadata(newMetadata: Record<string, any>): void {
    this.metadata = { ...this.metadata, ...newMetadata };
  }
}
