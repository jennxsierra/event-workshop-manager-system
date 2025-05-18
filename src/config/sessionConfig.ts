import session from "express-session";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create and export the session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Export the session middleware
export const sessionMiddleware = session(sessionConfig);

// Export the config in case it's needed elsewhere
export default sessionConfig;