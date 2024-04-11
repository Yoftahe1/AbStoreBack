import * as mongoose from "mongoose";

import config from "../config/index";

export default async () => {
  const connection = await mongoose.connect(config.databaseURL);
  return connection.connection.db;
};
