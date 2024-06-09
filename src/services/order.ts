import { Schema, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

import Order from "../models/order";
import Response from "../utils/response";
import { IOrderQuery, IParams, IProduct } from "../types/order";
import config from "../config";
import Product from "../models/product";
import transporter from "../utils/transporter";
import { orderVerification } from "../email";
import Driver from "../models/driver";
import { Chapa } from "chapa-nodejs";
import User from "../models/user";

export default class OrderService {
  async getOrders(
    { page, status }: IOrderQuery,
    getUser: { userId: Types.ObjectId } | null
  ) {
    try {
      const totalCount = await Order.countDocuments({
        isPaid: true,
        status,
        ...getUser,
      });

      const pageSize = config.pageSize;

      const totalPages = Math.ceil(totalCount / pageSize);

      const orders = await Order.aggregate([
        {
          $sort: { createdAt: -1 },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $match: {
            isPaid: true,
            status,
            ...getUser,
          },
        },
        {
          $project: {
            key: "$_id",
            _id: 0,
            totalPrice: 1,
            status: 1,
            userInfo: {
              firstName: 1,
              lastName: 1,
              phoneNumber: 1,
              location: 1,
            },
            productCount: { $size: "$products" },
          },
        },
      ])
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      const response = new Response();

      return response.success(
        {
          orders,
          totalPages,
          currentPage: page,
          pageSize,
          totalCount,
        },
        "Orders has been fetched successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async findOne(params: IParams) {
    const { id } = params;
    try {
      const order = await Order.findById(id).populate({
        path: "products.productId",
      });

      if (!order) {
        const response = new Response();

        return response.notFound("Order doesn't exist.");
      }

      const response = new Response();

      return response.success(
        { products: order!.products },
        "Order has been fetched successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async create(products: IProduct[], userId: string, email: string) {
    try {
      let totalPrice = 20;

      const user = await User.findById(userId);

      for (const item of products) {
        const product = await Product.findById(item.id);

        if (!product) {
          const response = new Response();

          return response.internalError(`Product ${item.id} doesn't exist.`);
        } else {
          const price = product.price;
          const color = product.types.filter((e) => e.color === item.color);
          if (color.length > 0) {
            if (item.quantity < 1) {
              const response = new Response();

              return response.notFound(
                `Product ${item.id} with color ${item.color} quantity can't be less than one.`
              );
            } else if (color[0].quantity < item.quantity) {
              const response = new Response();

              return response.internalError(
                `Product ${item.id} with color ${item.color} has insufficient quantity.`
              );
            } else {
              totalPrice += item.quantity * price;
            }
          } else {
            const response = new Response();

            return response.notFound(
              `Product ${item.id} with color ${item.color} doesn't exist.`
            );
          }
        }
      }

      const productDb = products.map((product) => ({
        productId: product.id,
        color: product.color,
        quantity: product.quantity,
      }));

      const verificationKey = uuidv4();

      const today = new Date().toISOString();

      const order = new Order({
        userId,
        products: productDb,
        totalPrice,
        verificationKey,
        createdAt: today,
        updatedAt: today,
      });

      const message = orderVerification(email, verificationKey);

      await transporter.sendMail(message);

      const result = await order.save();

      for (const item of products) {
        const product = await Product.findById(item.id);

        const typeToUpdate = product!.types.find(
          (type) => type.color === item.color
        );

        typeToUpdate!.quantity -= item.quantity;

        if (typeToUpdate!.quantity === 0) {
          const indexToRemove = product!.types.findIndex(
            (type) => type.color === item.color
          );
          product!.types.splice(indexToRemove, 1);
        }

        product!.save();
      }

      const chapa = new Chapa({
        secretKey: config.ChapaSecretKey,
      });

      const tx_ref = result._id.toString();

      const chapaResponse = await chapa.initialize({
        first_name: user!.firstName,
        last_name: user!.lastName,
        email: user!.email,
        currency: "ETB",
        amount: totalPrice.toString(),
        return_url:`https://abstoreuser.onrender.com/success/${tx_ref}`,
        tx_ref: tx_ref,
      });

      const response = new Response();
      return response.created(
        chapaResponse,
        "Order has been created successfully."
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async verifyOrder(id: string) {
    try {
      const chapa = new Chapa({
        secretKey: config.ChapaSecretKey,
      });

      const chapaResponse = await chapa.verify({
        tx_ref: id,
      });

      if (chapaResponse.data.status !== "success") {
        const response = new Response();
        return response.created({ id }, "Order payment failed.");
      }

      await Order.findByIdAndUpdate(new Types.ObjectId(id), { isPaid: true });

      const response = new Response();
      return response.created({ id }, "Order payment successfully.");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async assignDriver(params: IParams, { driverId }: { driverId: string }) {
    const { id } = params;
    try {
      const order = await Order.findById(id);

      if (!order) {
        const response = new Response();

        return response.notFound("Order doesn't exist.");
      }

      const driver = await Driver.findById(driverId);

      if (!driver) {
        const response = new Response();

        return response.notFound("Driver doesn't exist.");
      }

      await Order.findByIdAndUpdate(id, { driverId, status: "Delivering" });

      const response = new Response();
      return response.created({ id }, "Order has been updated successfully.");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async deliveries(
    { page }: { page: number },
    { driverId }: { driverId: string }
  ) {
    try {
      const totalCount = await Order.countDocuments({
        driverId,
        status: "Delivering",
      });

      const pageSize = config.pageSize;

      const totalPages = Math.ceil(totalCount / pageSize);

      const orders = await Order.aggregate([
        {
          $match: {
            driverId: new Types.ObjectId(driverId),
            status: "Delivering",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            _id: 1,
            fullName: {
              $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
            },
            phoneNumber: "$userInfo.phoneNumber",
            location: "$userInfo.location",
          },
        },
      ])
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      const response = new Response();

      return response.success(
        {
          orders,
          totalPages,
          currentPage: page,
          pageSize,
          totalCount,
        },
        "Orders has been fetched successfully"
      );
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }

  async deliverOrder(
    params: IParams,
    { key }: { key: string },
    { driverId }: { driverId: string }
  ) {
    const { id } = params;
    try {
      const order = await Order.findById(id);

      if (!order) {
        const response = new Response();

        return response.notFound("Order doesn't exist.");
      }

      if (order.driverId?.toString() !== driverId) {
        const response = new Response();

        return response.notFound("Unauthorized delivery.");
      }

      if (key !== order.verificationKey) {
        const response = new Response();

        return response.notFound("Verification key don't match.");
      }

      await Order.findByIdAndUpdate(id, { status: "Delivered" });

      const response = new Response();
      return response.created({ id }, "Order has been delivered successfully.");
    } catch (error) {
      const response = new Response();

      return response.internalError(error);
    }
  }
}
