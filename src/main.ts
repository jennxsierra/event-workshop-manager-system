import express from "express";
import dotenv from "dotenv";
import config from "./config/appConfig.js";
import { configureExpress } from "./config/expressConfig.js";
import { configureRoutes } from "./config/routesConfig.js";
import { setupShutdownHandlers } from "./lib/prisma.js";

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Configure Express application
configureExpress(app);

// Configure routes
configureRoutes(app);

// Start server
const server = app.listen(config.port, () => {
  console.log(`${config.abbreviation} ${config.name} started at ${config.url}`);
});

// Set up shutdown handlers for graceful database disconnection
setupShutdownHandlers(server);