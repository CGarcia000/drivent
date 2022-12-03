import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { bookingSchema } from "@/schemas";
import { getBooking, postBooking, putBooking } from "@/controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBooking)
  .post("/", validateBody(bookingSchema), postBooking)
  .put("/:bookingId", validateBody(bookingSchema), putBooking);

export { bookingRouter };
