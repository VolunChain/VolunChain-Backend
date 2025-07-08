import { TestItem } from "../../../domain/entities/test-item.entity"

describe("TestItem Entity", () => {
  describe("Creation", () => {
    it("should create a test item with valid properties", () => {
      const testItem = TestItem.create("Test Item", 100, 5)

      expect(testItem).toBeInstanceOf(TestItem)
      expect(testItem.name).toBe("Test Item")
      expect(testItem.value).toBe(100)
      expect(testItem.age).toBe(5)
    })

    it("should throw error if name is empty", () => {
      expect(() => {
        TestItem.create("", 100, 5)
      }).toThrow("Name is required")
    })

    it("should throw error if name is only whitespace", () => {
      expect(() => {
        TestItem.create("   ", 100, 5)
      }).toThrow("Name is required")
    })

    it("should throw error if value is negative", () => {
      expect(() => {
        TestItem.create("Test Item", -1, 5)
      }).toThrow("Value must be non-negative")
    })

    it("should throw error if age is negative", () => {
      expect(() => {
        TestItem.create("Test Item", 100, -1)
      }).toThrow("Age must be non-negative")
    })

    it("should allow zero values", () => {
      expect(() => {
        TestItem.create("Test Item", 0, 0)
      }).not.toThrow()
    })
  })

  describe("Value Management", () => {
    let testItem: TestItem

    beforeEach(() => {
      testItem = TestItem.create("Test Item", 100, 5)
    })

    it("should update value with valid number", () => {
      testItem.updateValue(200)
      expect(testItem.value).toBe(200)
    })

    it("should allow updating value to zero", () => {
      testItem.updateValue(0)
      expect(testItem.value).toBe(0)
    })

    it("should throw error when updating value to negative", () => {
      expect(() => {
        testItem.updateValue(-10)
      }).toThrow("Value must be non-negative")
    })
  })

  describe("Age Management", () => {
    let testItem: TestItem

    beforeEach(() => {
      testItem = TestItem.create("Test Item", 100, 5)
    })

    it("should increment age by 1", () => {
      const originalAge = testItem.age
      testItem.incrementAge()
      expect(testItem.age).toBe(originalAge + 1)
    })

    it("should increment age multiple times", () => {
      const originalAge = testItem.age
      testItem.incrementAge()
      testItem.incrementAge()
      testItem.incrementAge()
      expect(testItem.age).toBe(originalAge + 3)
    })
  })
})
