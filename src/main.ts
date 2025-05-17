import express from "express";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";

import config from "./config/appConfig.js";
import logger from "./middleware/logger.js";
import { authenticate } from "./middleware/auth.js";
import { setupShutdownHandlers } from "./lib/prisma.js";
import { methodOverrideMiddleware } from "./middleware/methodOverride.js";
import notFound from "./middleware/notFound.js";

// Import routes
// import eventRoutes from "./routes/eventRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();
const app = express();

// Configure session
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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

// Authentication middleware
app.use(authenticate);

// Routes
// app.use("/events", eventRoutes);
// app.use("/users", userRoutes);
// app.use("/auth", authRoutes);

// Home route
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

// 404 handler for undefined routes
app.use(notFound);

// Start server
const server = app.listen(config.port, () => {
  console.log(`${config.abbreviation} ${config.name} started at ${config.url}`);
});

// Set up shutdown handlers for graceful database disconnection
setupShutdownHandlers(server);