// src/__tests__/database.test.ts
import AppDataSource from "../src/config/ormconfig";
import { TestItem } from "../src/entities/TestItem";

describe("Database Configuration", () => {
  beforeAll(async () => {
    // Initialize the database connection
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
  });

  afterAll(async () => {
    // Close the connection after testzs
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await AppDataSource.synchronize(false);
  });

  it("should connect to the database successfully", async () => {
    expect(AppDataSource.isInitialized).toBeTruthy();
  });

  it("should be using SQLite in test environment", () => {
    expect(AppDataSource.options.type).toBe("sqlite");
    expect(AppDataSource.options.database).toBe(":memory:");
  });

  it("should be able to create and retrieve data", async () => {
    // Create a test item
    const testRepository = AppDataSource.getRepository(TestItem);

    const testItem = new TestItem();
    testItem.name = "Test Item";
    testItem.value = 42;
    testItem.age = 11;

    // Save the item
    await testRepository.save(testItem);

    // Retrieve the item
    const savedItem = await testRepository.findOne({
      where: { name: "Test Item" },
    });

    const items = await testRepository.find();
    expect(items.length).toBe(1);

    expect(savedItem).toBeDefined();
    expect(savedItem?.name).toBe("Test Item");
    expect(savedItem?.value).toBe(42);
    expect(savedItem?.age).toBe(11);

    // Delete the item
    await testRepository.delete(items[0].id);
    const remainingItems = await testRepository.find();
    expect(remainingItems.length).toBe(0);
  });
});
