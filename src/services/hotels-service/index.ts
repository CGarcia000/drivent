import { requestError, notFoundError } from "@/errors";
import hotelsRepository from "@/repositories/hotels-repository";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";

async function getHotels(userId: number) {
  const enrollment = await hotelsRepository.findEnrollmentByUserId(userId);
  if (!enrollment) {
    throw requestError(httpStatus.UNAUTHORIZED, httpStatus["401_MESSAGE"]);
  }

  const ticket = await hotelsRepository.findPaymentAndTicketType(enrollment.Ticket[0].id);
  if (ticket.status !== TicketStatus.PAID || ticket._count.Payment < 1) {
    throw requestError(httpStatus.UNAUTHORIZED, httpStatus["401_MESSAGE"]);
  }
  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw requestError(httpStatus.UNAUTHORIZED, httpStatus["401_MESSAGE"]);
  }

  const hotels = await hotelsRepository.findHotels();
  if (hotels.length === 0) {
    throw notFoundError();
  }
  return hotels;
}

async function getRooms(userId: number, hotelId: number) {
  const enrollment = await hotelsRepository.findEnrollmentByUserId(userId);
  if (!enrollment) {
    throw requestError(httpStatus.UNAUTHORIZED, httpStatus["401_MESSAGE"]);
  }

  const ticket = await hotelsRepository.findPaymentAndTicketType(enrollment.Ticket[0].id);
  if (ticket.status !== TicketStatus.PAID || ticket._count.Payment < 1) {
    throw requestError(httpStatus.UNAUTHORIZED, httpStatus["401_MESSAGE"]);
  }
  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw requestError(httpStatus.UNAUTHORIZED, httpStatus["401_MESSAGE"]);
  }

  const hotel = await hotelsRepository.findHotelRooms(hotelId);
  if (hotel === null) {
    throw notFoundError();
  }
  return hotel;
}

const hotelService = {
  getHotels,
  getRooms,
};

export default hotelService;
