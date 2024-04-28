import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import config from "../config";
import Response from "../utils/response";
import {
  IUser,
  IUserAuth,
  IUserBan,
  IUserParams,
  IUserPassword,
  IUserQuery,
  IUserToken,
  IUserUpdate,
} from "../types/user";
import User from "../models/user";
import Otp from "../models/otp";
import transporter from "../utils/transporter";
import { forgotPassword } from "../email";

export default class UserService {
  async getUsers({ page, isBanned }: IUserQuery) {
    try {
      const totalCount = await User.countDocuments({
        "status.isBanned": isBanned,
      });

      const pageSize = config.pageSize;

      const totalPages = Math.ceil(totalCount / pageSize);

      const users = await User.aggregate([
        { $match: { "status.isBanned": isBanned } },
        {
          $project: {
            key: "$_id",
            fullName: { $concat: ["$firstName", " ", "$lastName"] },
            email: 1,
            phoneNumber: 1,
            address: "$location",
            banReason: "$status.banReason",
            status: "$status.isBanned",
            // status: 1,
            _id: 0,
          },
        },
      ])
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      const response = new Response();

      return response.success(
        {
          users,
          totalPages,
          currentPage: page,
          pageSize,
          totalCount,
        },
        "User has been fetched successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async create(newUser: IUser) {
    const { email, firstName, lastName, password, location, phoneNumber } =
      newUser;
    try {
      const emailExist = await User.findOne({ email });

      if (emailExist) {
        const response = new Response();

        return response.conflict("Email address already exist.");
      }

      const hashedPassword = await bcrypt.hash(password, config.saltRound);

      const today = new Date().toISOString();

      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        location,
        phoneNumber,
        createdAt: today,
        updatedAt: today,
      });
      const result = await user.save();

      const payload = {
        id: result._id,
        firstName,
        lastName,
        email,
        location,
        phoneNumber,
        role: "User",
      };

      const token = jwt.sign(payload, config.secretKey);

      const response = new Response();

      return response.created(
        {
          ...payload,
          token,
        },
        "User has been create successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async delete(token: IUserToken, params: IUserParams) {
    const { id } = params;
    const { id: tokenId } = token;
    try {
      if (id !== tokenId) {
        const response = new Response();

        return response.unauthorized("You don't have authorization.");
      }

      await User.deleteOne({ _id: id });

      const response = new Response();

      return response.success({ id }, "User has been deleted successfully");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async ban(params: IUserParams, banUser: IUserBan) {
    const { id } = params;

    try {
      const user = await User.findById(id);

      if (!user) {
        const response = new Response();

        return response.conflict("User doesn't exist.");
      }

      await User.updateOne(
        { _id: id },
        {
          status: {
            isBanned: true,
            bannedBy: "000",
            banReason: banUser.banReason,
          },
        }
      );

      const response = new Response();

      return response.success({ id }, "User has been banned successfully");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async unBan(params: IUserParams) {
    const { id } = params;

    try {
      const user = await User.findById(id);

      if (!user) {
        const response = new Response();

        return response.conflict("User doesn't exist.");
      }

      await User.updateOne(
        { _id: id },
        {
          status: {
            isBanned: false,
            bannedBy: "",
            banReason: "",
          },
        }
      );

      const response = new Response();

      return response.success({ id }, "User has been un banned successfully");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async update(
    token: IUserToken,
    params: IUserParams,
    updateUser: IUserUpdate
  ) {
    const { id } = params;
    const { id: tokenId, email, role } = token;
    const { firstName, lastName, location, phoneNumber } = updateUser;
    try {
      if (tokenId !== id) {
        const response = new Response();

        return response.unauthorized("You don't have authorization.");
      }

      await User.updateOne(
        { _id: id },
        {
          firstName: firstName.toUpperCase(),
          lastName: lastName.toUpperCase(),
          location: location.toUpperCase(),
          phoneNumber,
        }
      );

      const response = new Response();

      return response.success(
        {
          id,
          firstName: firstName.toUpperCase(),
          lastName: lastName.toUpperCase(),
          location: location.toUpperCase(),
          phoneNumber,
          role,
          email,
        },
        "User has been updated successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async changePassword(
    token: IUserToken,
    params: IUserParams,
    newPassword: IUserPassword
  ) {
    const { id } = params;
    const { id: tokenId } = token;
    const { password } = newPassword;
    try {
      if (id !== tokenId) {
        const response = new Response();

        return response.unauthorized("You don't have authorization.");
      }

      const hashedPassword = await bcrypt.hash(password, config.saltRound);

      await User.updateOne({ _id: id }, { password: hashedPassword });

      const response = new Response();

      return response.success(
        { id },
        "User password has been updated successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async status() {
    try {
      const bannedCount = await User.countDocuments({
        "status.isBanned": true,
      });

      const activeCount = await User.countDocuments({
        "status.isBanned": false,
      });

      const response = new Response();

      return response.success(
        [
          { name: "Active", value: activeCount, fill: "#0088FE" },
          { name: "Banned", value: bannedCount, fill: "#FF4B91" },
        ],
        "Users status fetched successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async signIn(auth: IUserAuth) {
    const { email, password } = auth;
    try {
      const user = await User.findOne({ email });

      if (!user) {
        const response = new Response();

        return response.conflict("User doesn't exist.");
      }

      if (user.status?.isBanned) {
        const response = new Response();

        return response.conflict(
          `You are banned b/c ${user.status?.banReason}.`
        );
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        const otpRecord = await Otp.findOne({ userId: user._id })
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

        await Otp.deleteMany({ userId: user._id });
      }

      const payload = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        location: user.location,
        phoneNumber: user.phoneNumber,
        role: "User",
      };

      const token = jwt.sign(payload, config.secretKey);

      const response = new Response();

      return response.success(
        { ...payload, token },
        "User signed in successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        const response = new Response();

        return response.conflict("User doesn't exist.");
      }

      const password = uuidv4();

      const hashedPassword = await bcrypt.hash(password, config.saltRound);

      const otp = new Otp({
        userId: user._id,
        otp: hashedPassword,
      });

      await otp.save();

      const message = forgotPassword(email, password);

      await transporter.sendMail(message);

      const response = new Response();

      return response.success(
        { id: user._id },
        "One time password has been sent successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }
}
