import { Schema, Types, model } from "mongoose";

interface IOtp {
  userId: Types.ObjectId;
  otp:string;
  createdAt?: Date;
}

const otpSchema = new Schema<IOtp>({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, expires: 3600, default: Date.now() },
});

const Otp = model<IOtp>("otp", otpSchema);

export default Otp;
