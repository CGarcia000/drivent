import { notFoundError, requestError } from "@/errors";
import paymentRepository from "@/repositories/payments-repository";
import { PaymentData } from "@/repositories/payments-repository";
import { CardData } from "@/protocols";
import httpStatus from "http-status";
import { Payment } from "@prisma/client";

async function getPayment(userId: number, ticketId: number): Promise<Payment> {
  const ticket = await paymentRepository.getTicketById(ticketId);
  if (!ticket) throw notFoundError();

  const enrollment = await paymentRepository.getEnrollmentById(ticket.enrollmentId);
  if (!enrollment) throw notFoundError();

  if (enrollment.userId !== userId) throw requestError(httpStatus.UNAUTHORIZED, httpStatus["401_MESSAGE"]);

  const payment = await paymentRepository.getPaymentByTicketId(ticket.id);
  if (!payment) throw notFoundError();

  return payment;
}

export type MakePayment = {
  ticketId: number;
  cardData: CardData
}

async function postPayment({ userId, ticketId, cardData }: PostPayment) {
  const ticket = await paymentRepository.getTicketById(ticketId);
  if (!ticket) throw notFoundError();

  const enrollment = await paymentRepository.getEnrollmentById(ticket.enrollmentId);
  if (!enrollment) throw notFoundError();

  if (enrollment.userId !== userId) throw requestError(httpStatus.UNAUTHORIZED, httpStatus["401_MESSAGE"]);

  const ticketTypePrice = await paymentRepository.getTicketPrice(ticket.ticketTypeId);
  if (!ticketTypePrice) throw notFoundError();

  const lastDigits: string = (cardData.number).toString().slice(-4);

  const paymentData: PaymentData = {
    ticketId,
    value: ticketTypePrice.price,
    cardIssuer: cardData.issuer,
    cardLastDigits: lastDigits
  };

  await paymentRepository.createNewPayment(paymentData);

  const payment = await paymentRepository.getPaymentByTicketId(ticket.id);
  if (!payment) throw notFoundError();

  return payment;
}

interface PostPayment extends MakePayment { userId: number; }

const paymentsService = {
  getPayment,
  postPayment,
};

export default paymentsService;
