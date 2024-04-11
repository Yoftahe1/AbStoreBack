import { Response, NextFunction } from "express";
import { Request as JWTRequest } from "express-jwt";

import User from "../../models/user";
import Admin from "../../models/admin";
import Driver from "../../models/driver";
import customResponse from "../../utils/response";

function authorization(allowedRoles: string[]) {
  return async (req: JWTRequest, res: Response, next: NextFunction) => {
    const token = req.auth;

    let error = null;

    if (token === undefined) {
      const response = new customResponse();
      error = response.unauthorized("Unauthorized access.");
    } else {
      if (!allowedRoles.includes(token.role)) {
        const response = new customResponse();
        error = response.unauthorized("Unauthorized access.");
      }

      if (token.role == "Owner") {
        let admin = await Admin.findOne({ _id: token.id });

        if (!admin) {
          const response = new customResponse();

          error = response.notFound("Admin doesn't exist.");
        } else {
          if (admin.role !== "Owner") {
            const response = new customResponse();

            error = response.conflict("Not Owner.");
          }
        }
      }

      if (token.role == "Admin") {
        let admin = await Admin.findOne({ _id: token.id });

        if (!admin) {
          const response = new customResponse();

          error = response.notFound("Admin doesn't exist.");
        } else {
          if (admin.role !== "Admin") {
            const response = new customResponse();

            error = response.conflict("Not Admin.");
          }
        }
      }

      if (token.role == "User") {
        let user = await User.findOne({ _id: token.id });

        if (!user) {
          const response = new customResponse();

          error = response.notFound("User doesn't exist.");
        }
      }

      if (token.role == "Driver") {
        let driver = await Driver.findOne({ _id: token.id });

        if (!driver) {
          const response = new customResponse();

          error = response.notFound("Driver doesn't exist.");
        }
      }
    }

    if (error) {
      return res.status(error.status).json(error.result);
    }

    next();
  };
}

export default authorization;
