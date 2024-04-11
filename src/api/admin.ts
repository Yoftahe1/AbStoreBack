import express, { Request, Response } from "express";
import { Request as JWTRequest } from "express-jwt";

import AdminService from "../services/admin";
import {
  adminQueryValidation,
  createAdminValidation,
  changeAdminPasswordValidation,
  signInAdminValidation,
  updateAdminValidation,
  adminParamValidation,
  forgotPasswordAdminValidation,
} from "../middleware/validation/admin";

import handleValidationError from "../middleware/validation/handleError";
import authenticateToken from "../middleware/auth/authenticateToken";
import authorization from "../middleware/auth/authorization";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorization(["Owner"]),
  adminQueryValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { page } = req.query;
    const adminService = new AdminService();

    const { status, result } = await adminService.getAdmins({
      page: Number(page),
    });

    res.status(status).json(result);
  }
);

router.post(
  "/create",
  authenticateToken,
  authorization(["Owner"]),
  createAdminValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const adminDto = req.body;

    const adminService = new AdminService();

    const { status, result } = await adminService.create(adminDto);

    res.status(status).json(result);
  }
);

router.delete(
  "/:id/delete",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  adminParamValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id: tokenId, firstName, lastName, email, role } = req.auth!;
    const { id } = req.params;

    const adminService = new AdminService();

    const { status, result } = await adminService.delete(
      { id: tokenId, firstName, lastName, email, role },
      { id }
    );

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/update",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  updateAdminValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id } = req.params;
    const { id: tokenId, firstName, lastName, email, role } = req.auth!;
    const adminDto = req.body;

    const adminService = new AdminService();

    const { status, result } = await adminService.update(
      { id: tokenId, firstName, lastName, email, role },
      { id },
      adminDto
    );

    res.status(status).json(result);
  }
);

router.patch(
  "/:id/changePassword",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  changeAdminPasswordValidation,
  handleValidationError,
  async (req: JWTRequest, res: Response) => {
    const { id } = req.params;
    const { id: tokenId, firstName, lastName, email, role } = req.auth!;
    const passwordDto = req.body;

    const adminService = new AdminService();

    const { status, result } = await adminService.changePassword(
      { id: tokenId, firstName, lastName, email, role },
      { id },
      passwordDto
    );

    res.status(status).json(result);
  }
);

router.post(
  "/signIn",
  signInAdminValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const signInDto = req.body;

    const adminService = new AdminService();

    const { status, result } = await adminService.signIn(signInDto);

    res.status(status).json(result);
  }
);

router.patch(
  "/forgotPassword",
  forgotPasswordAdminValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const {email} = req.body;

    const adminService = new AdminService();

    const { status, result } = await adminService.forgotPassword(email);

    res.status(status).json(result);
  }
);

export default router;
