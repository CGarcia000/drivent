import { bookingSchema } from "@/schemas";
import faker from "@faker-js/faker";

describe("bookingSchema", () => {
  const generateValidInput = () => ({
    roomId: faker.datatype.number(),
  });

  describe("when roomId is not valid", () => {
    it("should return error if roomId is not present", () => {
      const input = generateValidInput();
      delete input.roomId;

      const { error } = bookingSchema.validate(input);

      expect(error).toBeDefined();
    });

    it("should return error if roomId does not follow valid id format", () => {
      const input = generateValidInput();
      input.roomId = 1.1;

      const { error } = bookingSchema.validate(input);

      expect(error).toBeDefined();
    });
  });

  it("should return no error if input is valid", () => {
    const input = generateValidInput();

    const { error } = bookingSchema.validate(input);

    expect(error).toBeUndefined();
  });
});
