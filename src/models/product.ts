import { Schema, model } from "mongoose";
import { catagories } from "../constant";

interface IType {
  color: string;
  quantity: number;
}

interface IReview {
  userId: string;
  review: string;
}

interface IRating {
  userId: string;
  rating: number;
}

interface IProduct {
  name: string;
  description: string;
  category: string;
  images: string[];
  price: number;
  types: IType[];
  reviews?: IReview[];
  ratings?: IRating[];
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: catagories, required: true },
  images: { type: [String], required: true },
  price: { type: Number, required: true },
  types: {
    type: [
      {
        color: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    required: true,
  },
  reviews: {
    type: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
        message: { type: String, required: true },
      },
    ],
    default: [],
  },
  ratings: {
    type: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        rating: { type: Number, required: true },
      },
    ],
    default: [],
  },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Product = model<IProduct>("product", productSchema);

export default Product;
