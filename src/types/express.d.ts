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
  }
}

export {};
