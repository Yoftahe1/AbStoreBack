import { Schema, model } from "mongoose";

interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  location: string;
  phoneNumber: number;
  status?: { isBanned: boolean; bannedBy: string; banReason: string };
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  location: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  status: {
    type: {
      isBanned: { type: Boolean, default: false },
      bannedBy: { type: String, default: "" },
      banReason: { type: String, default: "" },
    },
    default: {
      isBanned: false,
      bannedBy: "",
      banReason: "",
    },
  },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const User = model<IUser>("user", userSchema);

export default User;
