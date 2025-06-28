import { Entity, Column } from "typeorm"
import { BaseEntity } from "../../../shared/domain/entities/base.entity"

export interface PhotoProps {
  id?: string
  url: string
  userId: string
  uploadedAt?: Date
  metadata?: Record<string, any>
}

@Entity("photos")
export class Photo extends BaseEntity {
  @Column({ type: "varchar", length: 500, nullable: false })
  url: string

  @Column({ type: "uuid", nullable: false })
  userId: string

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>

  // Domain logic and validation
  public validate(): boolean {
    if (!this.url || this.url.trim() === "") {
      throw new Error("Photo URL is required")
    }

    if (!/^https?:\/\/.+$/.test(this.url)) {
      throw new Error("Photo URL must be a valid HTTP/HTTPS URL")
    }

    if (!this.userId || this.userId.trim() === "") {
      throw new Error("User ID is required")
    }

    return true
  }

  // Update metadata
  public updateMetadata(newMetadata: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      ...newMetadata,
    }
  }

  // Static factory method
  public static create(props: PhotoProps): Photo {
    const photo = new Photo()
    photo.url = props.url
    photo.userId = props.userId
    photo.metadata = props.metadata ?? {}
    photo.validate()
    return photo
  }

  // Convert to plain object for persistence
  public toObject(): PhotoProps {
    return {
      id: this.id,
      url: this.url,
      userId: this.userId,
      uploadedAt: this.createdAt,
      metadata: this.metadata,
    }
  }
}
