import { Express } from "express";
import {
  eventRoutes,
  userRoutes,
  authRoutes,
  registrationRoutes,
  reportRoutes,
} from "../routes/index.js";
import { HomeController } from "../controllers/HomeController.js";
import notFound from "../middleware/notFound.js";

export const configureRoutes = (app: Express): void => {
  // Routes
  app.use("/events", eventRoutes);
  app.use("/users", userRoutes);
  app.use("/auth", authRoutes);
  app.use("/registrations", registrationRoutes);
  app.use("/reports", reportRoutes);

  // Home route with controller
  const homeController = new HomeController();
  app.get("/", homeController.getHomePage.bind(homeController));

  // 404 handler for undefined routes
  app.use(notFound);
};
