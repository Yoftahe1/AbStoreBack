import express, { Request, Response } from "express";

import DashboardService from "../services/dashboard";
import authorization from "../middleware/auth/authorization";
import authenticateToken from "../middleware/auth/authenticateToken";
import handleValidationError from "../middleware/validation/handleError";
import { filterQueryValidation } from "../middleware/validation/dashboard";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  async (_, res: Response) => {
    const dashboardService = new DashboardService();
    const { status, result } = await dashboardService.getTodayDashboard();

    res.status(status).json(result);
  }
);
router.get(
  "/filter",
  authenticateToken,
  authorization(["Admin", "Owner"]),
  filterQueryValidation,
  handleValidationError,
  async (req: Request, res: Response) => {
    const { startRange, endRange } = req.query;

    const dashboardService = new DashboardService();
    const { status, result } = await dashboardService.dashboardFilter({
      startRange: startRange!.toString(),
      endRange: endRange!.toString(),
    });

    res.status(status).json(result);
  }
);
export default router;
