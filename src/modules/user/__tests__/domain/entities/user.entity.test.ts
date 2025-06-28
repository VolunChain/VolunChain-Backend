import { User } from "../../../domain/entities/user.entity"

describe("User Entity", () => {
  describe("Creation", () => {
    it("should create a user with valid properties", () => {
      const user = new User()
      user.name = "John"
      user.lastName = "Doe"
      user.email = "john.doe@example.com"
      user.password = "hashedPassword"
      user.wallet = "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      user.isVerified = false

      expect(user.name).toBe("John")
      expect(user.lastName).toBe("Doe")
      expect(user.email).toBe("john.doe@example.com")
      expect(user.isVerified).toBe(false)
    })

    it("should have default verification status as false", () => {
      const user = new User()
      expect(user.isVerified).toBe(false)
    })
  })

  describe("Email Verification", () => {
    it("should set verification token and expiry", () => {
      const user = new User()
      const token = "verification-token-123"
      const expiry = new Date(Date.now() + 3600000) // 1 hour from now

      user.verificationToken = token
      user.verificationTokenExpires = expiry

      expect(user.verificationToken).toBe(token)
      expect(user.verificationTokenExpires).toBe(expiry)
    })

    it("should mark user as verified", () => {
      const user = new User()
      user.isVerified = true
      user.verificationToken = ""

      expect(user.isVerified).toBe(true)
      expect(user.verificationToken).toBe("")
      expect(user.verificationTokenExpires).toBeNull()
    })
  })

  describe("Wallet Integration", () => {
    it("should store wallet address", () => {
      const user = new User()
      const walletAddress = "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

      user.wallet = walletAddress

      expect(user.wallet).toBe(walletAddress)
    })
  })
})
