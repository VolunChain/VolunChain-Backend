import { Photo } from "../../../domain/entities/photo.entity"

describe("Photo Entity", () => {
  const validPhotoProps = {
    url: "https://example.com/photo.jpg",
    userId: "user-123",
    metadata: { size: 1024, format: "jpg" },
  }

  describe("Creation", () => {
    it("should create a photo with valid props", () => {
      const photo = Photo.create(validPhotoProps)

      expect(photo).toBeInstanceOf(Photo)
      expect(photo.url).toBe(validPhotoProps.url)
      expect(photo.userId).toBe(validPhotoProps.userId)
      expect(photo.metadata).toEqual(validPhotoProps.metadata)
    })

    it("should create photo with empty metadata if not provided", () => {
      const photo = Photo.create({
        url: validPhotoProps.url,
        userId: validPhotoProps.userId,
      })

      expect(photo.metadata).toEqual({})
    })
  })

  describe("Validation", () => {
    it("should throw error if URL is empty", () => {
      expect(() => {
        Photo.create({
          ...validPhotoProps,
          url: "",
        })
      }).toThrow("Photo URL is required")
    })

    it("should throw error if URL is invalid", () => {
      expect(() => {
        Photo.create({
          ...validPhotoProps,
          url: "invalid-url",
        })
      }).toThrow("Photo URL must be a valid HTTP/HTTPS URL")
    })

    it("should throw error if userId is empty", () => {
      expect(() => {
        Photo.create({
          ...validPhotoProps,
          userId: "",
        })
      }).toThrow("User ID is required")
    })

    it("should accept valid HTTP and HTTPS URLs", () => {
      expect(() => {
        Photo.create({
          ...validPhotoProps,
          url: "http://example.com/photo.jpg",
        })
      }).not.toThrow()

      expect(() => {
        Photo.create({
          ...validPhotoProps,
          url: "https://example.com/photo.jpg",
        })
      }).not.toThrow()
    })
  })

  describe("Metadata Management", () => {
    it("should update metadata", () => {
      const photo = Photo.create(validPhotoProps)
      const newMetadata = { width: 800, height: 600 }

      photo.updateMetadata(newMetadata)

      expect(photo.metadata).toEqual({
        ...validPhotoProps.metadata,
        ...newMetadata,
      })
    })

    it("should merge metadata without overwriting existing keys", () => {
      const photo = Photo.create(validPhotoProps)
      const additionalMetadata = { width: 800 }

      photo.updateMetadata(additionalMetadata)

      expect(photo.metadata).toEqual({
        size: 1024,
        format: "jpg",
        width: 800,
      })
    })
  })

  describe("ToObject", () => {
    it("should convert entity to plain object", () => {
      const photo = Photo.create(validPhotoProps)
      const photoObject = photo.toObject()

      expect(photoObject).toEqual(
        expect.objectContaining({
          url: validPhotoProps.url,
          userId: validPhotoProps.userId,
          metadata: validPhotoProps.metadata,
        }),
      )
      expect(photoObject.id).toBeTruthy()
      expect(photoObject.uploadedAt).toBeInstanceOf(Date)
    })
  })
})
