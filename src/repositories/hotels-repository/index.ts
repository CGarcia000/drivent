import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findHotelRooms(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId
    },
    include: {
      Rooms: true,
    }
  });
}

async function findEnrollmentByUserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: {
      userId,
    },
    include: {
      Ticket: true,
    },
  });
}

async function findPaymentAndTicketType(ticketId: number) {
  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    include: {
      TicketType: true,
      _count: {
        select: { Payment: true },
      }
    }
  });
}

const hotelsRepository = {
  findHotels,
  findEnrollmentByUserId,
  findPaymentAndTicketType,
  findHotelRooms,
};

export default hotelsRepository;
