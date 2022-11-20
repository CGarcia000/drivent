import { notFoundError } from "@/errors";
import ticketsRepository from "@/repositories/tickets-repository";
import { TicketResponse } from "@/protocols";

async function getTicketsTypes() {
  const ticketTypes = await ticketsRepository.findTicketTypes();
  return ticketTypes;
}

async function getTicket(userId: number): Promise<TicketResponse> {
  const enrollment = await ticketsRepository.getEnrollmentByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.getTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const ticketType = await ticketsRepository.getTicketTypeById(ticket.ticketTypeId);
  if (!ticketType) throw notFoundError();

  return {
    TicketType: {
      ...ticketType
    },
    ...ticket,
  };
}

async function postTicket(body: PostTicket): Promise<TicketResponse> {
  const enrollment = await ticketsRepository.getEnrollmentByUserId(body.userId);
  if (!enrollment) throw notFoundError();

  const ticketType = await ticketsRepository.getTicketTypeById(body.ticketTypeId);
  if (!ticketType) throw notFoundError();

  await ticketsRepository.insertTicket(enrollment.id, ticketType.id);

  const ticket = await ticketsRepository.getTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  return {
    TicketType: {
      ...ticketType
    },
    ...ticket,
  };
}

export type CreateTicket = Omit<PostTicket, "userId">;

type PostTicket = {
  ticketTypeId: number;
  userId: number
}

const ticketsService = {
  getTicketsTypes,
  getTicket,
  postTicket,
};

export default ticketsService;
