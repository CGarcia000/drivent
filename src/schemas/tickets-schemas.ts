import { CreateTicket } from "@/services/tickets-service";
import Joi from "joi";

export const createTicketSchema = Joi.object<CreateTicket>({
  ticketTypeId: Joi.number().required(),
});
