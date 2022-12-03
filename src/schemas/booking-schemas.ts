import { bookingParams } from "@/services";
import Joi from "joi";

export const bookingSchema = Joi.object<bookingParams>({
  roomId: Joi.number().integer().required(),
});
