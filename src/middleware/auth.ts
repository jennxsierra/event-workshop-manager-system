import { Request, Response, NextFunction } from "express";
import { Role } from "../models/user/Role.js";
import prisma from "../lib/prisma.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip authentication for public routes
    const publicRoutes = [
      "/",
      "/auth/login",
      "/auth/register",
      "/events",
      /^\/events\/\d+$/,
      /^\/assets\/.*/,
      /^\/css\/.*/,
      /^\/js\/.*/,
    ];

    // Check if this is a public route
    const isPublicRoute = publicRoutes.some((route) => {
      if (typeof route === "string") {
        return req.path === route;
      }
      return route.test(req.path);
    });

    // Check if user is logged in via session
    if (req.session.userId) {
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: BigInt(req.session.userId) },
      });

      if (user) {
        // Attach user to request
        req.user = {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || undefined,
          organization: user.organization || undefined,
          role: user.role as Role,
        };
      } else {
        // Clear invalid session
        req.session.userId = undefined;
      }
    }

    // If this is not a public route and user is not authenticated, redirect to login
    if (!isPublicRoute && !req.user) {
      if (req.headers.accept?.includes("application/json")) {
        res.status(401).json({ error: "Authentication required" });
        return; // Add this to fix the return type issue
      }
      res.redirect("/auth/login");
      return; // Add this to fix the return type issue
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    next(error);
  }
};

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      if (req.headers.accept?.includes("application/json")) {
        res.status(401).json({ error: "Authentication required" });
      } else {
        res.redirect("/auth/login");
      }
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      if (req.headers.accept?.includes("application/json")) {
        res.status(403).json({ error: "Access denied" });
      } else {
        res.status(403).render("error", { message: "Access denied" });
      }
      return;
    }

    next();
  };
};
