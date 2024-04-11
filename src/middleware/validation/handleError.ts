import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

function handleValidationError(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(500).json({
      data: {},
      message: "Something went wrong while validating input.",
      error: errors.array(),
    });
  }

  next();
}

export default handleValidationError;
