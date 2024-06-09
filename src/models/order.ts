import { Schema, Types, model } from "mongoose";

interface IProducts {
  productId: Types.ObjectId;
  color: string;
  quantity: number;
}

interface IOrder {
  userId: Types.ObjectId;
  totalPrice: number;
  products: IProducts[];
  status?: "Processing" | "Delivering" | "Delivered";
  verificationKey: string;
  isPaid: boolean;
  driverId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  products: {
    type: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        color: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    default: [],
    required: true,
  },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Processing", "Delivering", "Delivered"],
    default: "Processing",
  },
  driverId: { type: Schema.Types.ObjectId, ref: "driver", required: false },
  verificationKey: { type: String, required: true },
  isPaid: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Order = model<IOrder>("order", orderSchema);

export default Order;
