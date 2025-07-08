import { NFT } from "../../../domain/entities/nft.entity"
import { User } from "../../../../user/domain/entities/user.entity"
import { Organization } from "../../../../organization/domain/entities/organization.entity"

describe("NFT Entity", () => {
  let nft: NFT
  let user: User
  let organization: Organization

  beforeEach(() => {
    user = new User()
    user.id = "user-123"
    user.name = "John"
    user.lastName = "Doe"
    user.email = "john@example.com"

    organization = new Organization({
      id: "org-123",
      name: "Test Org",
      email: "org@example.com",
      description: "Test Organization Description",
      isVerified: false
    })

    nft = new NFT()
    nft.user = user
    nft.userId = user.id
    nft.organization = organization
    nft.organizationId = organization.id
    nft.description = "Test NFT Description"
    nft.isMinted = false
  })

  describe("Creation", () => {
    it("should create an NFT with valid properties", () => {
      expect(nft.userId).toBe("user-123")
      expect(nft.organizationId).toBe("org-123")
      expect(nft.description).toBe("Test NFT Description")
      expect(nft.isMinted).toBe(false)
    })
  })

  describe("Minting", () => {
    it("should mint NFT with token details", () => {
      const tokenId = "token-123"
      const contractAddress = "0x123..."
      const metadataUri = "https://metadata.uri"

      nft.mint(tokenId, contractAddress, metadataUri)

      expect(nft.tokenId).toBe(tokenId)
      expect(nft.contractAddress).toBe(contractAddress)
      expect(nft.metadataUri).toBe(metadataUri)
      expect(nft.isMinted).toBe(true)
    })

    it("should throw error when minting already minted NFT", () => {
      nft.isMinted = true

      expect(() => {
        nft.mint("token-123", "0x123...")
      }).toThrow("NFT is already minted")
    })
  })

  describe("Metadata Management", () => {
    it("should update metadata URI", () => {
      const newMetadataUri = "https://new-metadata.uri"

      nft.updateMetadata(newMetadataUri)

      expect(nft.metadataUri).toBe(newMetadataUri)
    })
  })

  describe("Ownership", () => {
    it("should check if NFT is owned by user", () => {
      expect(nft.isOwnedBy("user-123")).toBe(true)
      expect(nft.isOwnedBy("other-user")).toBe(false)
    })
  })
})
