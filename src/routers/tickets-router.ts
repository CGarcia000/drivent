import { Router } from "express";
import { createTicketSchema } from "@/schemas/tickets-schemas";
import { getTicketsTypes, getTickets, postTickets } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";

const ticketsRouter = Router();

ticketsRouter
  .use("/*", authenticateToken)
  .get("/", getTickets)
  .post("/", validateBody(createTicketSchema), postTickets)
  .get("/types", getTicketsTypes);

export { ticketsRouter };
