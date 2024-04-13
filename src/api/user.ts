import express, { Request, Response } from "express";
import { Request as JWTRequest } from "express-jwt";

import UserService from "../services/user";
import handleValidationError from "../middleware/validation/handleError";
import {
  banUser,
  userQueryValidation,
  createUserValidation,
  signInUserValidation,
  changeUserPasswordValidation,
  updateUserValidation,
  userParamValidation,
  forgotPasswordUserValidation,
} from "../middleware/validation/user";
import transporter from "../utils/transporter";
import config from "../config/index";
import authenticateToken from "../middleware/auth/authenticateToken";
import authorization from "../middleware/auth/authorization";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorization(["Owner", "Admin"]),
  userQueryValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { page, banned } = req.query;
    const userService = new UserService();

    const { status, result } = await userService.getUsers({
      page: Number(page),
      isBanned: banned === "true",
    });

    res.status(status).json(result);
  }
);

router.post(
  "/signup",
  createUserValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const userDto = req.body;

    const userService = new UserService();

    const { status, result } = await userService.create(userDto);

    res.status(status).json(result);
  }
);

router.delete(
  "/:id/delete",
  authenticateToken,
  authorization(["User"]),
  userParamValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id: tokenId, firstName, lastName, email, role } = req.auth!;
    const { id } = req.params;

    const userService = new UserService();

    const { status, result } = await userService.delete(
      { id: tokenId, firstName, lastName, email, role },
      { id }
    );

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/ban",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  banUser,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const statusDto = req.body;

    const userService = new UserService();

    const { status, result } = await userService.ban({ id }, statusDto);

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/unBan",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  userParamValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const userService = new UserService();

    const { status, result } = await userService.unBan({ id });

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/update",
  authenticateToken,
  authorization(["User"]),
  updateUserValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id } = req.params;
    const userDto = req.body;
    const { id: tokenId, firstName, lastName, email, role } = req.auth!;

    const userService = new UserService();

    const { status, result } = await userService.update(
      { id: tokenId, firstName, lastName, email, role },
      { id },
      userDto
    );

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/changePassword",
  authenticateToken,
  authorization(["User"]),
  changeUserPasswordValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id: tokenId, firstName, lastName, email, role } = req.auth!;
    const { id } = req.params;
    const passwordDto = req.body;

    const userService = new UserService();

    const { status, result } = await userService.changePassword(
      { id: tokenId, firstName, lastName, email, role },
      { id },
      passwordDto
    );

    res.status(status).json(result);
  }
);

router.post(
  "/signIn",
  signInUserValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const signInDto = req.body;

    const userService = new UserService();

    const { status, result } = await userService.signIn(signInDto);

    res.status(status).json(result);
  }
);

router.get(
  "/status",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  async (req: Request, res: Response) => {
    const userService = new UserService();

    const { status, result } = await userService.status();

    res.status(status).json(result);
  }
);

router.patch(
  "/forgotPassword",
  forgotPasswordUserValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const {email} = req.body;

    const userService = new UserService();

    const { status, result } = await userService.forgotPassword(email);

    res.status(status).json(result);
  }
);

export default router;
