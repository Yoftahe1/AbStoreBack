import cors from "cors";
import bodyParser from "body-parser";
import express, { Application } from "express";

import userRoute from "../api/user";
import orderRoute from "../api/order";
import adminRoute from "../api/admin";
import driverRoute from "../api/driver";
import productRoute from "../api/product";
import dashboardRoute from "../api/dashboard";
import handleAuthentication from "../middleware/auth/handelAuth";
import path from "path";

export default async ({ app }: { app: Application }) => {
  app.use(cors());
  app.use(express.json());
  const uploads=path.join(__dirname+'../../../')
  app.use("/",express.static(uploads))
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/users", userRoute);
  app.use("/orders", orderRoute);
  app.use("/admins", adminRoute);
  app.use("/drivers", driverRoute);
  app.use("/products", productRoute);
  app.use("/dashboard", dashboardRoute);

  app.use(handleAuthentication);

  return app;
};
