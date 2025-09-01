import NFTRepository from "../../../repositories/nft.repository";

// filepath: src/modules/nft/_tests_/application/repository/repository.test.ts
// Note: We recommend installing an extension to run jest tests.

describe("NFTRepository - reference-related operations", () => {
    let repository: any;
    let mockModel: any;
    let mockPrisma: any;

    beforeEach(() => {
        repository = new NFTRepository();

        mockModel = {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn(),
        };

        // Some codebases use nft while others nFT for the Prisma model accessor.
        // Provide both to make tests resilient to either shape.
        mockPrisma = {
            nft: mockModel,
            nFT: mockModel,
        };

        // Inject the mocked prisma into the repository instance regardless of how it's referenced inside.
        (repository as any).prisma = mockPrisma;
    });

    it("should expose CRUD methods", () => {
        expect(typeof repository.createNFT).toBe("function");
        expect(typeof repository.getNFTById).toBe("function");
        expect(typeof repository.getNFTByUserId).toBe("function");
        expect(typeof repository.deleteNFT).toBe("function");
    });

    it("createNFT() - creates an NFT and returns its reference", async () => {
        const payload = {
            userId: "user-1",
            organizationId: "org-1",
            description: "An NFT for testing",
            isMinted: false,
        };

        const created = { id: "nft-1", ...payload };
        mockModel.create.mockResolvedValue(created);

        const result = await repository.createNFT(payload);

        expect(mockModel.create).toHaveBeenCalled();
        // Common Prisma pattern: create({ data: payload })
        expect(mockModel.create.mock.calls[0][0]).toEqual(expect.objectContaining({ data: payload }));
        expect(result).toEqual(created);
    });

    it("getNFTById() - retrieves an NFT using its ID", async () => {
        const nft = { id: "nft-2", userId: "user-2", description: "by id" };
        mockModel.findUnique.mockResolvedValue(nft);

        const result = await repository.getNFTById("nft-2");

        expect(mockModel.findUnique).toHaveBeenCalled();
        // Common Prisma pattern: findUnique({ where: { id } })
        expect(mockModel.findUnique.mock.calls[0][0]).toEqual(expect.objectContaining({ where: { id: "nft-2" } }));
        expect(result).toEqual(nft);
    });

    it("getNFTByUserId() - retrieves NFTs owned by a specific user", async () => {
        const nfts = [
            { id: "nft-a", userId: "owner-1", description: "A" },
            { id: "nft-b", userId: "owner-1", description: "B" },
        ];
        mockModel.findMany.mockResolvedValue(nfts);

        const result = await repository.getNFTByUserId("owner-1");

        expect(mockModel.findMany).toHaveBeenCalled();
        // Common Prisma pattern: findMany({ where: { userId } })
        expect(mockModel.findMany.mock.calls[0][0]).toEqual(expect.objectContaining({ where: { userId: "owner-1" } }));
        expect(result).toEqual(nfts);
    });

    it("deleteNFT() - removes an NFT and ensures it is no longer retrievable", async () => {
        const deleted = { id: "nft-del", userId: "owner-del", description: "to be deleted" };
        mockModel.delete.mockResolvedValue(deleted);

        const result = await repository.deleteNFT("nft-del");

        expect(mockModel.delete).toHaveBeenCalled();
        // Common Prisma pattern: delete({ where: { id } })
        expect(mockModel.delete.mock.calls[0][0]).toEqual(expect.objectContaining({ where: { id: "nft-del" } }));
        expect(result).toEqual(deleted);

        // Simulate subsequent retrieval returns null (not found)
        mockModel.findUnique.mockResolvedValueOnce(null);
        const afterDelete = await repository.getNFTById("nft-del");
        expect(afterDelete).toBeNull();
    });
});