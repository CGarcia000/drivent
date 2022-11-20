import { prisma } from "@/config";
import { TicketStatus, Payment } from "@prisma/client";

async function getEnrollmentById(id: number) {
  return prisma.enrollment.findFirst({
    where: {
      id
    }
  });
}

async function getTicketPrice(ticketTypeId: number) {
  return prisma.ticketType.findFirst({
    where: {
      id: ticketTypeId
    },
    select: {
      price: true
    }
  });
}

async function getPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId
    }
  });
}

async function getTicketById(id: number) {
  return prisma.ticket.findFirst({
    where: {
      id
    }
  });
}

async function createNewPayment(paymentData: PaymentData) {
  await prisma.ticket.update({
    where: {
      id: paymentData.ticketId
    },
    data: {
      status: TicketStatus.PAID
    }
  });
  await prisma.payment.create({
    data: {
      ticketId: paymentData.ticketId,
      value: paymentData.value,
      cardIssuer: paymentData.cardIssuer,
      cardLastDigits: paymentData.cardLastDigits,
    }
  });
}

export type PaymentData = Omit<Payment, "id" | "createdAt" | "updatedAt">;

const ticketsRepository = {
  getTicketById,
  getEnrollmentById,
  getPaymentByTicketId,
  getTicketPrice,
  createNewPayment,
};

export default ticketsRepository;
