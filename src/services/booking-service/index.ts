import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError, forbiddenError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";

async function checkRoom(roomId: number) {
  const room = await hotelRepository.findRoomIdWithBooking(roomId);
  if (room === null) {
    throw notFoundError();
  } else if (room.capacity <= room.Booking.length) {
    throw forbiddenError();
  }
}

async function getBooking(userId: number) {
  const booking = await bookingRepository.findBookingWithRoom(userId);
  if (!booking) {
    throw notFoundError();
  }
  return {
    id: booking.id,
    Room: booking.Room
  };
}

async function createBooking(userId: number, roomId: number) {
  const bookingAlreadyCreated = await bookingRepository.findBookingWithRoom(userId);
  if (bookingAlreadyCreated) {
    throw forbiddenError();
  }

  await checkRoom(roomId);

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw forbiddenError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }

  const booking = await bookingRepository.createBooking(userId, roomId);
  return booking;
}

async function updateBooking(userId: number, bookingId: number, roomId: number) {
  const bookingAlreadyCreated = await bookingRepository.findBookingWithRoom(userId);
  if (!bookingAlreadyCreated || bookingAlreadyCreated.id !== bookingId) {
    throw forbiddenError();
  }

  await checkRoom(roomId);

  const booking = await bookingRepository.updateBooking(bookingId, roomId);
  return booking;
}

export type bookingParams = {
  roomId: number;
}

export const bookingService = {
  getBooking,
  createBooking,
  updateBooking,
};

