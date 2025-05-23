import { EventManager } from "./EventManager.js";
import { IReportManager } from "./IReportManager.js";
import prisma from "../../lib/prisma.js";

export class ReportManager implements IReportManager {
  eventManager: EventManager;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
  }

  async generateSummaryReport(): Promise<any> {
    try {
      // Get total events count
      const totalEvents = await prisma.event.count();

      // Get registration statistics
      const totalRegistrations = await prisma.registration.count();
      const activeRegistrations = await prisma.registration.count({
        where: { cancelled: false },
      });

      // Get participant statistics
      const totalParticipants = await prisma.user.count({
        where: { role: "PARTICIPANT" },
      });

      // Generate the summary report
      return {
        totalEvents,
        registrationStats: {
          total: totalRegistrations,
          active: activeRegistrations,
          cancelled: totalRegistrations - activeRegistrations,
        },
        totalParticipants,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to generate summary report:", error);
      throw error;
    }
  }

  async generateDetailedReport(): Promise<any> {
    try {
      // Get events with registration counts
      const events = await prisma.event.findMany({
        include: {
          registrations: {
            where: { cancelled: false },
          },
        },
      });

      const eventReports = events.map((event) => ({
        id: event.id,
        name: event.name,
        date: event.eventDate,
        registrationCount: event.registrations.length,
        capacityPercentage: (event.registrations.length / event.capacity) * 100,
      }));

      return {
        events: eventReports,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to generate detailed report:", error);
      throw error;
    }
  }

  async generateHistoricalReport(): Promise<any> {
    try {
      // Get historical data by month
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      const events = await prisma.event.findMany({
        where: {
          eventDate: {
            gte: sixMonthsAgo,
          },
        },
        orderBy: {
          eventDate: "asc",
        },
        include: {
          registrations: true,
        },
      });

      // Process data by month
      const monthlyData: Record<string, any> = {};

      events.forEach((event) => {
        const monthYear = `${
          event.eventDate.getMonth() + 1
        }/${event.eventDate.getFullYear()}`;

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            eventCount: 0,
            registrationCount: 0,
            cancellationCount: 0,
          };
        }

        monthlyData[monthYear].eventCount++;
        monthlyData[monthYear].registrationCount += event.registrations.length;
        monthlyData[monthYear].cancellationCount += event.registrations.filter(
          (r) => r.cancelled
        ).length;
      });

      return {
        monthlyData,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to generate historical report:", error);
      throw error;
    }
  }
  
  async generateSystemStats(): Promise<any> {
    try {
      // Get total events
      const totalEvents = await prisma.event.count();
      
      // Get total registrations
      const totalRegistrations = await prisma.registration.count();
      
      // Get total users
      const totalUsers = await prisma.user.count();
      
      return {
        totalEvents,
        totalRegistrations,
        totalUsers,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to generate system stats:", error);
      throw error;
    }
  }
}
