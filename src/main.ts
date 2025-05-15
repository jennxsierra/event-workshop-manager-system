import express from "express";
import dotenv from "dotenv";
import path from "path";

import config from "./config/appConfig.js";
import logger from "./middleware/logger.js";

import { setupShutdownHandlers } from "./lib/prisma.js";

import { methodOverrideMiddleware } from "./middleware/methodOverride.js";
import notFound from "./middleware/notFound.js";

// Load environment variables
dotenv.config();
const app = express();

// Use the logger middleware
app.use(logger);

// Use the method override middleware
app.use(methodOverrideMiddleware);

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" folder
app.use(express.static(path.join(process.cwd(), "public")));

// Set EJS as the templating engine and set the views directory
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src/views"));

// Routes

// 404 handler for undefined routes
app.use(notFound);

// Start server
const server = app.listen(config.port, () => {
  console.log(`${config.abbreviation} ${config.name} started at ${config.url}`);
});

// Set up shutdown handlers for graceful database disconnection
setupShutdownHandlers(server);
