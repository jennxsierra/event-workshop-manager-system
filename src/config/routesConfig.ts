import { Express, Request, Response } from "express";
import {
  eventRoutes,
  userRoutes,
  authRoutes,
  registrationRoutes,
  reportRoutes,
} from "../routes/index.js";
import notFound from "../middleware/notFound.js";

export const configureRoutes = (app: Express): void => {
  // Routes
  app.use("/events", eventRoutes);
  app.use("/users", userRoutes);
  app.use("/auth", authRoutes);
  app.use("/registrations", registrationRoutes);
  app.use("/reports", reportRoutes);

  // Home route
  app.get("/", (req: Request, res: Response) => {
    res.render("home", { user: req.user });
  });

  // 404 handler for undefined routes
  app.use(notFound);
};
