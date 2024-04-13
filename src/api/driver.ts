import { Request as JWTRequest } from "express-jwt";
import express, { Request, Response } from "express";

import {
  driverQueryValidation,
  driverParamValidation,
  createDriverValidation,
  updateDriverValidation,
  signInDriverValidation,
  changeDriverPasswordValidation,
  forgotPasswordDriverValidation,
} from "../middleware/validation/driver";
import DriverService from "../services/driver";
import authorization from "../middleware/auth/authorization";
import authenticateToken from "../middleware/auth/authenticateToken";
import handleValidationError from "../middleware/validation/handleError";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorization(["Owner"]),
  driverQueryValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { page } = req.query;
    const driverService = new DriverService();

    const { status, result } = await driverService.getDrivers({
      page: Number(page),
    });

    res.status(status).json(result);
  }
);

router.post(
  "/create",
  authenticateToken,
  authorization(["Owner"]),
  createDriverValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const driverDto = req.body;

    const driverService = new DriverService();

    const { status, result } = await driverService.create(driverDto);

    res.status(status).json(result);
  }
);

router.delete(
  "/:id/delete",
  authenticateToken,
  authorization(["Driver", "Owner"]),
  driverParamValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id: tokenId, firstName, lastName, email, role } = req.auth!;
    const { id } = req.params;

    const driverService = new DriverService();

    const { status, result } = await driverService.delete(
      { id: tokenId, firstName, lastName, email, role },
      { id }
    );

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/update",
  authenticateToken,
  authorization(["Driver"]),
  updateDriverValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id } = req.params;
    const { id: tokenId, firstName, lastName, email, role } = req.auth!;
    const driverDto = req.body;

    const driverService = new DriverService();

    const { status, result } = await driverService.update(
      { id: tokenId, firstName, lastName, email, role },
      { id },
      driverDto
    );

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/changePassword",
  authenticateToken,
  authorization(["Driver"]),
  changeDriverPasswordValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id } = req.params;
    const { id: tokenId, firstName, lastName, email, role } = req.auth!;
    const passwordDto = req.body;

    const driverService = new DriverService();

    const { status, result } = await driverService.changePassword(
      { id: tokenId, firstName, lastName, email, role },
      { id },
      passwordDto
    );

    res.status(status).json(result);
  }
);

router.post(
  "/signIn",
  signInDriverValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const signInDto = req.body;

    const driverService = new DriverService();

    const { status, result } = await driverService.signIn(signInDto);

    res.status(status).json(result);
  }
);

router.patch(
  "/forgotPassword",
  forgotPasswordDriverValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const {email} = req.body;

    const driverService = new DriverService();

    const { status, result } = await driverService.forgotPassword(email);

    res.status(status).json(result);
  }
);

export default router;
