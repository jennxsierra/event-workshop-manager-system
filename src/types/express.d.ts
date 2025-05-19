import { Role } from "../models/user/Role.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: bigint;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        organization?: string;
        role: Role;
      };
    }
  }
}

// Extend the session interface
declare module "express-session" {
  interface SessionData {
    userId: string;
    // Add messages property for flash messages
    messages?: {
      success?: string;
      error?: string;
      warning?: string;
      info?: string;
    };
    // Add user property to store user information
    user?: {
      id: bigint;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      role: Role;
      phone?: string;
      organization?: string;
    };
  }
}

export {};