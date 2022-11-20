import { CardData } from "@/protocols";
import { MakePayment } from "@/services/payments-service";
import Joi from "joi";

export const makePaymentSchema = Joi.object<MakePayment>({
  ticketId: Joi.number().required(),
  cardData: Joi.object<CardData>({
    issuer: Joi.string().required().min(3),
    number: Joi.string().required().min(15),
    name: Joi.string().required().min(3),
    expirationDate: Joi.string().required().max(7),
    cvv: Joi.string().required().length(3),
  })
});
