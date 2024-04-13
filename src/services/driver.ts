import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import {
  IDriver,
  IDriverToken,
  IDriverQuery,
  IDriverParams,
  IDriverUpdate,
  IDriverPassword,
  IDriverAuth,
} from "../types/driver";
import config from "../config";
import Driver from "../models/driver";
import Response from "../utils/response";
import transporter from "../utils/transporter";
import registration from "../email/registration";
import { driverAdd, forgotPassword } from "../email";
import Order from "../models/order";
import Otp from "../models/otp";

export default class DriverService {
  async getDrivers({ page }: IDriverQuery) {
    try {
      const totalCount = await Driver.countDocuments();

      const pageSize = config.pageSize;

      const totalPages = Math.ceil(totalCount / pageSize);

      const drivers = await Driver.aggregate([
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
          drivers,
          totalPages,
          currentPage: page,
          pageSize,
          totalCount,
        },
        "Drivers has been fetched successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async create(newDriver: IDriver) {
    const { email, firstName, lastName } = newDriver;
    try {
      const emailExist = await Driver.findOne({ email });

      if (emailExist) {
        const response = new Response();

        return response.conflict("Email address already exist.");
      }

      const password = uuidv4();

      const hashedPassword = await bcrypt.hash(password, config.saltRound);

      const driver = new Driver({
        firstName: firstName.toUpperCase(),
        lastName: lastName.toUpperCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      const message = driverAdd(email, password);

      await transporter.sendMail(message);
      
      const result = await driver.save();

      const response = new Response();

      return response.created(
        { id: result._id },
        "Driver has been create successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async delete(token: IDriverToken, params: IDriverParams) {
    const { id } = params;
    const { id: tokenId, role } = token;
    try {
      const driverExist = await Driver.findById(id);

      const totalCount = await Order.countDocuments({
        driverId:id,
        status: "Delivering",
      });
      
      if(totalCount!==0){
        const response = new Response();

        return response.notFound("Can't be deleted before completion of deliveries.");
      }

      if (!driverExist) {
        const response = new Response();

        return response.notFound("Driver doesn't exist.");
      }

      if (tokenId != id && role === "Owner") {
        await Driver.findByIdAndDelete(id);
      } else if (tokenId === id && role === "Driver") {
        await Driver.findByIdAndDelete(id);
      } else {
        const response = new Response();

        return response.unauthorized("You don't have authorization.");
      }


      const response = new Response();

      return response.success({ id }, "Driver has been deleted successfully");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async update(
    token: IDriverToken,
    params: IDriverParams,
    updateDriver: IDriverUpdate
  ) {
    const { id } = params;
    const { id: tokenId, email, role } = token;
    const { firstName, lastName } = updateDriver;

    try {
      if (tokenId === id) {
        await Driver.updateOne(
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

      return response.success(payload, "Driver has been updated successfully");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async changePassword(
    token: IDriverToken,
    params: IDriverParams,
    newPassword: IDriverPassword
  ) {
    const { id } = params;
    const { id: tokenId } = token;
    const { password } = newPassword;

    try {
      const hashedPassword = await bcrypt.hash(password, config.saltRound);

      if (tokenId === id) {
        await Driver.updateOne({ _id: id }, { password: hashedPassword });
      } else {
        const response = new Response();

        return response.unauthorized("You don't have authorization.");
      }

      const response = new Response();

      return response.success(
        { id },
        "Driver password has been changed successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async signIn(auth: IDriverAuth) {
    const { email, password } = auth;
    try {
      const driver = await Driver.findOne({ email });

      if (!driver) {
        const response = new Response();

        return response.conflict("Driver doesn't exist.");
      }

      const passwordMatch = await bcrypt.compare(password, driver.password);

      if (!passwordMatch) {
        const otpRecord = await Otp.findOne({ userId: driver._id })
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

        await Otp.deleteMany({ userId: driver._id });
      }

      const payload = {
        id: driver._id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        role: "Driver",
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
      const driver = await Driver.findOne({ email });

      if (!driver) {
        const response = new Response();

        return response.conflict("Driver doesn't exist.");
      }

      const password = uuidv4();

      const hashedPassword = await bcrypt.hash(password, config.saltRound);

      const otp = new Otp({
        userId: driver._id,
        otp: hashedPassword,
      });

      await otp.save();

      const message = forgotPassword(email, password);

      await transporter.sendMail(message);

      const response = new Response();

      return response.success(
        { id: driver._id },
        "One time password has been sent successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

}
