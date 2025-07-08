import { UserVolunteer } from "../../../domain/entities/user-volunteer.entity"

describe("UserVolunteer Entity", () => {
  const validUserId = "user-123"
  const validVolunteerId = "volunteer-456"

  describe("Creation", () => {
    it("should create a user-volunteer association with valid IDs", () => {
      const userVolunteer = UserVolunteer.create(validUserId, validVolunteerId)

      expect(userVolunteer).toBeInstanceOf(UserVolunteer)
      expect(userVolunteer.userId).toBe(validUserId)
      expect(userVolunteer.volunteerId).toBe(validVolunteerId)
      expect(userVolunteer.joinedAt).toBeInstanceOf(Date)
    })

    it("should throw error if userId is empty", () => {
      expect(() => {
        UserVolunteer.create("", validVolunteerId)
      }).toThrow("User ID and Volunteer ID are required")
    })

    it("should throw error if volunteerId is empty", () => {
      expect(() => {
        UserVolunteer.create(validUserId, "")
      }).toThrow("User ID and Volunteer ID are required")
    })

    it("should throw error if both IDs are empty", () => {
      expect(() => {
        UserVolunteer.create("", "")
      }).toThrow("User ID and Volunteer ID are required")
    })
  })

  describe("Assignment Checks", () => {
    let userVolunteer: UserVolunteer

    beforeEach(() => {
      userVolunteer = UserVolunteer.create(validUserId, validVolunteerId)
    })

    it("should check if user is assigned", () => {
      expect(userVolunteer.isUserAssigned(validUserId)).toBe(true)
      expect(userVolunteer.isUserAssigned("other-user")).toBe(false)
    })

    it("should check if volunteer is assigned", () => {
      expect(userVolunteer.isVolunteerAssigned(validVolunteerId)).toBe(true)
      expect(userVolunteer.isVolunteerAssigned("other-volunteer")).toBe(false)
    })
  })

  describe("Timestamps", () => {
    it("should set joinedAt timestamp on creation", () => {
      const beforeCreation = new Date()
      const userVolunteer = UserVolunteer.create(validUserId, validVolunteerId)
      const afterCreation = new Date()

      expect(userVolunteer.joinedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(userVolunteer.joinedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    })
  })
})
