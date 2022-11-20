import { Router } from "express";
import { makePaymentSchema } from "@/schemas/payments-schemas";
import { getPaymentData, postPayment } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";

const paymentsRouter = Router();

paymentsRouter
  .use("/*", authenticateToken)
  .get("/", getPaymentData)
  .post("/process", validateBody(makePaymentSchema), postPayment);

export { paymentsRouter };
