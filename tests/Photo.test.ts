import { Photo } from "../src/entities/Photo";

describe("Photo Entity", () => {
  describe("constructor", () => {
    it("should create a valid photo instance with all properties", () => {
      const photoProps = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        url: "https://example.com/photo.jpg",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        uploadedAt: new Date(),
        metadata: { size: "1024kb", format: "jpg" },
      };

      const photo = new Photo(photoProps);

      expect(photo.id).toBe(photoProps.id);
      expect(photo.url).toBe(photoProps.url);
      expect(photo.userId).toBe(photoProps.userId);
      expect(photo.uploadedAt).toBe(photoProps.uploadedAt);
      expect(photo.metadata).toEqual(photoProps.metadata);
    });

    it("should create an empty photo instance when no props are provided", () => {
      const photo = new Photo({});

      expect(photo.id).toBeUndefined();
      expect(photo.url).toBeUndefined();
      expect(photo.userId).toBeUndefined();
      expect(photo.uploadedAt).toBeUndefined();
      expect(photo.metadata).toEqual({});
    });
  });

  describe("validate", () => {
    it("should validate a photo with all required fields", () => {
      const photo = new Photo({
        url: "https://example.com/photo.jpg",
        userId: "123e4567-e89b-12d3-a456-426614174001",
      });

      expect(photo.validate()).toBe(true);
    });

    it("should throw an error when url is missing", () => {
      const photo = new Photo({
        userId: "123e4567-e89b-12d3-a456-426614174001",
      });

      expect(() => photo.validate()).toThrow("Photo URL is required");
    });

    it("should throw an error when url is invalid", () => {
      const photo = new Photo({
        url: "invalid-url",
        userId: "123e4567-e89b-12d3-a456-426614174001",
      });

      expect(() => photo.validate()).toThrow("Photo URL is invalid");
    });

    it("should throw an error when userId is missing", () => {
      const photo = new Photo({
        url: "https://example.com/photo.jpg",
      });

      expect(() => photo.validate()).toThrow("User ID is required");
    });
  });

  describe("updateMetadata", () => {
    it("should merge new metadata with existing metadata", () => {
      const photo = new Photo({
        url: "https://example.com/photo.jpg",
        userId: "123e4567-e89b-12d3-a456-426614174001",
        metadata: { size: "1024kb", format: "jpg" },
      });

      photo.updateMetadata({ width: 800, height: 600 });

      expect(photo.metadata).toEqual({
        size: "1024kb",
        format: "jpg",
        width: 800,
        height: 600,
      });
    });

    it("should create metadata object if it was undefined", () => {
      const photo = new Photo({
        url: "https://example.com/photo.jpg",
        userId: "123e4567-e89b-12d3-a456-426614174001",
      });

      photo.updateMetadata({ width: 800, height: 600 });

      expect(photo.metadata).toEqual({
        width: 800,
        height: 600,
      });
    });
  });
});
