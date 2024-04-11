import express from "express";

import loaders from "./loaders/index";
import config from "./config/index";

async function startServer() {
  const app = express();

  await loaders({ expressApp: app });

  app.listen(config.port, () => {
    console.log(`Your server is ready !`);
  });
}

startServer();
