import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import config from "../config";
import Response from "../utils/response";
import Admin from "../models/admin";
import {
  IAdmin,
  IAdminAuth,
  IAdminParams,
  IAdminPassword,
  IAdminQuery,
  IAdminToken,
  IAdminUpdate,
} from "../types/admin";
import { adminAdd, forgotPassword } from "../email";
import transporter from "../utils/transporter";
import Otp from "../models/otp";

export default class AdminService {
  async getAdmins({ page }: IAdminQuery) {
    try {
      const totalCount = (await Admin.countDocuments()) - 1;

      const pageSize = config.pageSize;

      const totalPages = Math.ceil(totalCount / pageSize);

      const admins = await Admin.aggregate([
        {
          $match: {
            role: "Admin",
          },
        },
        {
          $project: {
            key: "$_id",
            fullName: { $concat: ["$firstName", " ", "$lastName"] },
            email: 1,
            role: 1,
            _id: 0,
          },
        },
      ])
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      const response = new Response();

      return response.success(
        {
          admins,
          totalPages,
          currentPage: page,
          pageSize,
          totalCount,
        },
        "Admins has been fetched successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async create(newAdmin: IAdmin) {
    const { email, firstName, lastName } = newAdmin;
    try {
      const emailExist = await Admin.findOne({ email });

      if (emailExist) {
        const response = new Response();

        return response.conflict("Email address already exist.");
      }

      const password = uuidv4();

      const hashedPassword = await bcrypt.hash(password, config.saltRound);

      const admin = new Admin({
        firstName: firstName.toUpperCase(),
        lastName: lastName.toUpperCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      const message = adminAdd(email, password);

      await transporter.sendMail(message);

      const result = await admin.save();

      const response = new Response();

      return response.created(
        { id: result._id },
        "Admin has been create successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async delete(token: IAdminToken, params: IAdminParams) {
    const { id } = params;
    const { id: tokenId, role } = token;
    try {
      const adminExist = await Admin.findOne({ _id: id });

      if (!adminExist) {
        const response = new Response();

        return response.notFound("Admin doesn't exist.");
      }

      if (tokenId != id && role === "Owner") {
        await Admin.deleteOne({ _id: id });
      } else if (tokenId === id && role === "Admin") {
        await Admin.deleteOne({ _id: id });
      } else if (tokenId === id && role === "Owner") {
        const response = new Response();

        return response.forbidden("You are not allowed to delete your account");
      } else {
        const response = new Response();

        return response.unauthorized("You don't have authorization.");
      }

      const response = new Response();

      return response.success({ id }, "Admin has been deleted successfully");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async update(
    token: IAdminToken,
    params: IAdminParams,
    updateAdmin: IAdminUpdate
  ) {
    const { id } = params;
    const { id: tokenId, email, role } = token;
    const { firstName, lastName } = updateAdmin;

    try {
      if (tokenId === id) {
        await Admin.updateOne(
          { _id: id },
          {
            firstName: firstName.toUpperCase(),
            lastName: lastName.toUpperCase(),
          }
        );
      } else {
        const response = new Response();

        return response.unauthorized("You don't have authorization.");
      }

      const payload = {
        id,
        role,
        email,
        lastName: lastName.toUpperCase(),
        firstName: firstName.toUpperCase(),
      };

      const response = new Response();

      return response.success(payload, "Admins has been updated successfully");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async changePassword(
    token: IAdminToken,
    params: IAdminParams,
    newPassword: IAdminPassword
  ) {
    const { id } = params;
    const { id: tokenId } = token;
    const { password } = newPassword;

    try {
      const hashedPassword = await bcrypt.hash(password, config.saltRound);

      if (tokenId === id) {
        await Admin.updateOne({ _id: id }, { password: hashedPassword });
      } else {
        const response = new Response();

        return response.unauthorized("You don't have authorization.");
      }

      const response = new Response();

      return response.success(
        { id },
        "Admin password has been updated successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async signIn(auth: IAdminAuth) {
    const { email, password } = auth;
    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        const response = new Response();

        return response.conflict("Admin doesn't exist.");
      }

      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (!passwordMatch) {
        const otpRecord = await Otp.findOne({ userId: admin._id })
          .sort({ createdAt: -1 })
          .exec();

        if (!otpRecord) {
          const response = new Response();

          return response.conflict("Email and password don't match.");
        }

        const otpMatch = await bcrypt.compare(password, otpRecord.otp);

        if (!otpMatch) {
          const response = new Response();

          return response.conflict("Email and otp don't match.");
        }

        await Otp.deleteMany({ userId: admin._id });
      }

      const payload = {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
      };

      const token = jwt.sign(payload, config.secretKey);

      const response = new Response();

      return response.success({ ...payload, token }, "Signed in successfully.");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async forgotPassword(email: string) {
    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        const response = new Response();

        return response.conflict("Admin doesn't exist.");
      }

      const password = uuidv4();

      const hashedPassword = await bcrypt.hash(password, config.saltRound);

      const otp = new Otp({
        userId: admin._id,
        otp: hashedPassword,
      });

      await otp.save();

      const message = forgotPassword(email, password);

      await transporter.sendMail(message);

      const response = new Response();

      return response.success(
        { id: admin._id },
        "One time password has been sent successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }
}
