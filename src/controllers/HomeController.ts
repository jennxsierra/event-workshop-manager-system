import { Request, Response } from "express";
import { BaseController } from "./BaseController.js";
import prisma from "../lib/prisma.js";

export class HomeController extends BaseController {
  constructor() {
    super();
  }

  // Render the home page with upcoming events
  async getHomePage(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Get the current date
      const now = new Date();

      // Get upcoming events (limiting to 3)
      const upcomingEvents = await prisma.event.findMany({
        where: {
          eventDate: {
            gte: now,
          },
        },
        orderBy: {
          eventDate: "asc",
        },
        include: {
          registrations: {
            where: {
              cancelled: false,
            },
          },
        },
        take: 3,
      });

      // Render the home page with the event data
      this.render(res, "home", {
        pageName: "home",
        upcomingEvents,
      });
    });
  }
}
