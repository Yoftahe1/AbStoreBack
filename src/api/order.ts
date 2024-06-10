import express, { Request, Response } from "express";
import OrderService from "../services/order";
import { Request as JWTRequest } from "express-jwt";
import authenticateToken from "../middleware/auth/authenticateToken";
import authorization from "../middleware/auth/authorization";
import {
  orderQueryValidation,
  orderParamValidation,
  orderDriverValidation,
  orderDeliveriesValidation,
  orderDeliverValidation,
  orderVerificationValidation
} from "../middleware/validation/order";
import handleValidationError from "../middleware/validation/handleError";
import { Types } from "mongoose";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorization(["User", "Admin", "Owner"]),
  orderQueryValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { page, orderStatus } = req.query;
    const role = req.auth!.role;

    const getUser =
      role === "User" ? { userId: new Types.ObjectId(req.auth!.id) } : null;

    const orderService = new OrderService();

    const { status, result } = await orderService.getOrders(
      { page: Number(page), status: `${orderStatus}` },
      getUser
    );

    res.status(status).json(result);
  }
);

router.get(
  "/deliveries",
  authenticateToken,
  authorization(["Driver"]),
  orderDeliveriesValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { page } = req.query;
    const driverId = req.auth!.id;

    const orderService = new OrderService();

    const { status, result } = await orderService.deliveries(
      { page: Number(page) },
      { driverId }
    );

    res.status(status).json(result);
  }
);

router.get(
  "/:id",
  authenticateToken,
  authorization(["User", "Admin", "Owner"]),
  orderParamValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const orderService = new OrderService();

    const { status, result } = await orderService.findOne({ id });

    res.status(status).json(result);
  }
);

router.post(
  "/create",
  authenticateToken,
  authorization(["User"]),
  async (req: JWTRequest, res: Response) => {
    const orderDto = req.body;
    const userId = req.auth!.id;
    const email = req.auth!.email;
    const orderService = new OrderService();

    const { status, result } = await orderService.create(
      orderDto,
      userId,
      email
    );

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/assignDriver",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  orderDriverValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { driverId } = req.body;

    const orderService = new OrderService();

    const { status, result } = await orderService.assignDriver(
      { id },
      { driverId }
    );

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/deliver",
  authenticateToken,
  authorization(["Driver"]),
  orderDeliverValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id } = req.params;
    const { key } = req.body;
    const driverId = req.auth!.id;

    const orderService = new OrderService();

    const { status, result } = await orderService.deliverOrder(
      { id },
      { key },
      { driverId }
    );

    res.status(status).json(result);
  }
);

router.patch(
  "/verifyOrder/:id",
  orderVerificationValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const orderService = new OrderService();

    const { status, result } = await orderService.verifyOrder(id);

    res.status(status).json(result);
  }
);

export default router;
