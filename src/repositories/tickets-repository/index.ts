import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";

async function findTicketTypes() {
  return prisma.ticketType.findMany();
}

async function getEnrollmentByUserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: {
      userId,
    }
  });
}

async function getTicketByEnrollmentId(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: {
      enrollmentId
    }
  });
}

async function getTicketTypeById(ticketTypeId: number) {
  return prisma.ticketType.findFirst({
    where: {
      id: ticketTypeId
    }
  });
}

async function insertTicket(enrollmentId: number, ticketTypeId: number) {
  await prisma.ticket.create({
    data: {
      status: TicketStatus.RESERVED,
      ticketTypeId,
      enrollmentId,
    }
  });
}

const ticketsRepository = {
  getEnrollmentByUserId,
  getTicketByEnrollmentId,
  getTicketTypeById,
  findTicketTypes,
  insertTicket,
};

export default ticketsRepository;
