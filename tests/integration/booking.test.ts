import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import { prisma } from "@/config";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createUser,
  createBookingWithoutPayment,
  createHotel,
  createRoomWithHotelId,
  createRandomRoomWithHotelId,
  createRoomWithOneCapacity,
  createTicketTypeRemote,
  createEnrollmentWithAddress,
  createTicket,
  createTicketTypeForHotel,
  createPayment,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user has no booking ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and booking data when user has booking ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBookingWithoutPayment(user.id, room.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          capacity: room.capacity,
          hotelId: room.hotelId,
          name: room.name,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        }
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 when body is not given", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when body is not valid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(invalidBody);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe("when body is valid", () => {
      const generateValidBody = (id?: number) => ({
        roomId: id ?? faker.datatype.number(),
      });

      it("should respond with status 403 when roomId is negative", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const body = { roomId: -200 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when roomId is -1", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const body = { roomId: -1 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when roomId is equal 0", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const body = { roomId: 0 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when user already has a booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        await createBookingWithoutPayment(user.id, room.id);

        const body = generateValidBody(room.id);

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 404 when room doesn't exists", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const body = generateValidBody();

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 403 when room isn't available", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const userWithBooking = await createUser();
        const hotel = await createHotel();
        const room = await createRoomWithOneCapacity(hotel.id);

        await createBookingWithoutPayment(userWithBooking.id, room.id);

        const body = generateValidBody(room.id);

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when user has no ticket", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const body = generateValidBody(room.id);

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when user has ticket for remote event", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const body = generateValidBody(room.id);

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when user has ticket without hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeForHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const body = generateValidBody(room.id);

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when user has no payment", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeForHotel(true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        const body = generateValidBody(room.id);

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 200 and with bookingId when user can make a booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeForHotel(true);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);

        const body = generateValidBody(room.id);

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        const booking = await prisma.booking.findFirst({ where: { userId: user.id } });

        expect(response.status).toBe(httpStatus.OK);
        expect(booking).toBeDefined();
        expect(response.body).toEqual(
          {
            bookingId: booking.id
          }
        );
      });
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 when body is not given", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when body is not valid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(invalidBody);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe("when body is valid", () => {
      const generateValidBody = (id?: number) => ({
        roomId: id ?? faker.datatype.number(),
      });

      it("should respond with status 403 when roomId is negative", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const body = { roomId: -200 };

        const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when roomId is -1", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const body = { roomId: -1 };

        const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when roomId is equal 0", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const body = { roomId: 0 };

        const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
      it("should respond with status 403 when bookingId is negative", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const body = generateValidBody();

        const response = await server.put("/booking/-200").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when bookingId is -1", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const body = generateValidBody();

        const response = await server.put("/booking/-1").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when bookingId is equal 0", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const body = generateValidBody();

        const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when user doesn't have a booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const body = generateValidBody(room.id);

        const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when bookingId param isn't the user's booking id", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const userWithBooking = await createUser();
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        await createBookingWithoutPayment(user.id, room.id);
        const booking = await createBookingWithoutPayment(userWithBooking.id, room.id);

        const body = generateValidBody(room.id);

        const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 404 when room doesn't exists", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const booking = await createBookingWithoutPayment(user.id, room.id);

        const body = generateValidBody();

        const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 403 when room isn't available", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const userWithBooking = await createUser();
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const fullRoom = await createRoomWithOneCapacity(hotel.id);

        const booking = await createBookingWithoutPayment(user.id, room.id);
        await createBookingWithoutPayment(userWithBooking.id, fullRoom.id);

        const body = generateValidBody(fullRoom.id);

        const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 200 and with bookingId when user can update their booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const hotel = await createHotel();
        const room = await createRandomRoomWithHotelId(hotel.id);
        const newRoom = await createRandomRoomWithHotelId(hotel.id);

        const booking = await createBookingWithoutPayment(user.id, room.id);

        const body = generateValidBody(newRoom.id);

        const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

        const newBooking = await prisma.booking.findFirst({ where: { userId: user.id } });

        expect(response.status).toBe(httpStatus.OK);
        expect(newBooking).toBeDefined();
        expect(newBooking.roomId).toBe(newRoom.id);
        expect(newBooking.id).toBe(booking.id);
        expect(response.body).toEqual(
          {
            bookingId: newBooking.id
          }
        );
      });
    });
  });
});
