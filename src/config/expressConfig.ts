import path from "path";
import express, { Express } from "express";
import logger from "../middleware/logger.js";
import expressLayouts from "express-ejs-layouts";
import { authenticate } from "../middleware/auth.js";
import { flashMiddleware } from "../middleware/flash.js";
import { sessionMiddleware } from "./sessionConfig.js";
import { methodOverrideMiddleware } from "../middleware/methodOverride.js";

export const configureExpress = (app: Express): void => {
  // Apply session middleware
  app.use(sessionMiddleware);

  // Apply flash middleware for flash messages
  app.use(flashMiddleware);

  // Use the logger middleware
  app.use(logger);

  // Use the method override middleware
  app.use(methodOverrideMiddleware);

  // Middleware to parse URL-encoded bodies and JSON
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Serve static files from the "public" folder
  app.use(express.static(path.join(process.cwd(), "public")));

  // Set EJS as the templating engine and set the views directory
  app.set("view engine", "ejs");
  app.set("views", path.join(process.cwd(), "src/views"));

  // Add express-ejs-layouts middleware
  app.use(expressLayouts);
  app.set("layout", "layouts/main");
  app.set("layout extractScripts", true);
  app.set("layout extractStyles", true);

  // Authentication middleware
  app.use(authenticate);
};
