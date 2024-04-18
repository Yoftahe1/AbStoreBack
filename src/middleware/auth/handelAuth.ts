import { Request, Response, NextFunction } from "express";

function handleAuthentication(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.code === "invalid_token") {
    return res.status(401).json({
      data: {},
      message: "Invalid token",
      error: [],
    });
  }

  return res.status(401).json({
    data: {},
    message: "Unauthenticated",
    error: [], 
  });
}

export default handleAuthentication;
