import { AuthenticatedRequest } from "@/middlewares";
import paymentsService from "@/services/payments-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getPaymentData(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const ticketId = Number(req.query.ticketId);
  if (!ticketId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const payment = await paymentsService.getPayment(userId, ticketId);
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === "RequestError") {
      return res.sendStatus(error.status);
    }
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function postPayment(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const payment = await paymentsService.postPayment({ userId, ...req.body });
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === "RequestError") {
      return res.sendStatus(error.status);
    }
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}
