import nodemailer from "nodemailer";
import config from "../config/index";

const configuration = {
  service: "gmail",
  auth: {
    user: config.email,
    pass: config.password,
  },
};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email,
    pass: config.password,
  },
});

export default transporter;
