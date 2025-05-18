import { PrismaClient } from "@prisma/client";
import type { Server } from "http";

// Create a single instance of Prisma Client to be used throughout the app
const prisma = new PrismaClient();

// Setup shutdown handlers
function setupShutdownHandlers(server: Server) {
  const shutdown = async () => {
    console.log("\nDisconnecting from database...");
    await prisma.$disconnect();

    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  };

  // Listen for termination signals
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

export { prisma as default, setupShutdownHandlers };
