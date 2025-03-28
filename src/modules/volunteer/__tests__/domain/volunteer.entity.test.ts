import { Volunteer } from "../../domain/volunteer.entity";

describe("Volunteer Entity", () => {
  const validVolunteerProps = {
    name: "Test Volunteer",
    description: "Test Description",
    requirements: "Test Requirements",
    projectId: "project-123",
    incentive: "Test Incentive",
  };

  describe("Creation", () => {
    it("should create a volunteer with valid props", () => {
      const volunteer = Volunteer.create(validVolunteerProps);

      expect(volunteer).toBeInstanceOf(Volunteer);
      expect(volunteer.name).toBe(validVolunteerProps.name);
      expect(volunteer.description).toBe(validVolunteerProps.description);
      expect(volunteer.requirements).toBe(validVolunteerProps.requirements);
      expect(volunteer.projectId).toBe(validVolunteerProps.projectId);
      expect(volunteer.incentive).toBe(validVolunteerProps.incentive);
    });

    it("should generate a UUID if not provided", () => {
      const volunteer = Volunteer.create(validVolunteerProps);

      expect(volunteer.id).toBeTruthy();
      expect(volunteer.id.length).toBeGreaterThan(0);
    });
  });

  describe("Validation", () => {
    it("should throw error if name is empty", () => {
      expect(() => {
        Volunteer.create({
          ...validVolunteerProps,
          name: "",
        });
      }).toThrow("Name is required");
    });

    it("should throw error if description is empty", () => {
      expect(() => {
        Volunteer.create({
          ...validVolunteerProps,
          description: "",
        });
      }).toThrow("Description is required");
    });

    it("should throw error if requirements is empty", () => {
      expect(() => {
        Volunteer.create({
          ...validVolunteerProps,
          requirements: "",
        });
      }).toThrow("Requirements are required");
    });

    it("should throw error if projectId is missing", () => {
      expect(() => {
        Volunteer.create({
          ...validVolunteerProps,
          projectId: "",
        });
      }).toThrow("Project ID is required");
    });
  });

  describe("Update", () => {
    it("should update volunteer properties", () => {
      const volunteer = Volunteer.create(validVolunteerProps);

      volunteer.update({
        name: "Updated Name",
        description: "Updated Description",
        requirements: "Updated Requirements",
        incentive: "Updated Incentive",
      });

      expect(volunteer.name).toBe("Updated Name");
      expect(volunteer.description).toBe("Updated Description");
      expect(volunteer.requirements).toBe("Updated Requirements");
      expect(volunteer.incentive).toBe("Updated Incentive");
    });

    it("should not modify properties if not provided", () => {
      const volunteer = Volunteer.create(validVolunteerProps);
      const originalName = volunteer.name;

      volunteer.update({});

      expect(volunteer.name).toBe(originalName);
    });
  });

  describe("ToObject", () => {
    it("should convert entity to plain object", () => {
      const volunteer = Volunteer.create(validVolunteerProps);
      const volunteerObject = volunteer.toObject();

      expect(volunteerObject).toEqual(
        expect.objectContaining({
          name: validVolunteerProps.name,
          description: validVolunteerProps.description,
          requirements: validVolunteerProps.requirements,
          projectId: validVolunteerProps.projectId,
          incentive: validVolunteerProps.incentive,
        })
      );
    });
  });
});
