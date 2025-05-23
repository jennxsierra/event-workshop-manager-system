import { Request, Response } from "express";
import { BaseController } from "./BaseController.js";
import { EventManager } from "../models/manager/EventManager.js";
import { ReportManager } from "../models/manager/ReportManager.js";
import { Role } from "../models/user/Role.js";
import prisma from "../lib/prisma.js";

export class ReportController extends BaseController {
  private reportManager: ReportManager;

  constructor() {
    super();
    this.reportManager = new ReportManager(new EventManager());
  }

  // Event reports (admin only)
  async getEventReports(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const stats = await this.reportManager.generateSummaryReport();
      this.render(res, "reports/events", {
        stats,
        eventData: stats.eventData || [],
        pageName: "reports",
      });
    });
  }

  // Attendance reports (admin only)
  async getAttendanceReports(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      // Get query parameters for filters
      const category = req.query.category as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      // Create filters object
      const filters = {
        category,
        startDate,
        endDate
      };
      
      // Create query string for export link
      let queryString = '';
      if (req.query) {
        queryString = Object.keys(req.query)
          .map(key => `${key}=${encodeURIComponent(req.query[key] as string)}`)
          .join('&');
      }

      const stats = await this.reportManager.generateDetailedReport(filters);
      
      // Add attendanceData to the template variables if not included in stats
      this.render(res, "reports/attendance", {
        stats,
        filters,
        attendanceData: stats.attendanceData || [],
        queryString,
        pageName: "reports",
      });
    });
  }

  // Data exports (admin only)
  async getExports(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      // Get events for dropdown
      const events = await prisma.event.findMany({
        orderBy: { eventDate: 'desc' },
        take: 20 // Limit to most recent 20 events
      });

      this.render(res, "reports/exports", {
        stats: {},
        events,
        pageName: "reports",
      });
    });
  }

  // Show reports dashboard (admin only)
  async getReportsDashboard(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      // Get system statistics for the dashboard
      const stats = await this.reportManager.generateSystemStats();

      this.render(res, "reports/index", {
        pageName: "reports",
        stats: stats
      });
    });
  }
  
  // Export events to CSV (admin only)
  async exportEventsCSV(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      // Get query parameters for filters
      const category = req.query.category as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      // Create filters object
      const filters = {
        category,
        startDate,
        endDate
      };
      
      // Generate CSV
      const csvData = await this.reportManager.exportEventsToCSV(filters);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=events-export.csv');
      
      // Send CSV data
      res.send(csvData);
    });
  }
  
  // Export registrations to CSV (admin only)
  async exportRegistrationsCSV(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      // Get query parameters for filters
      const eventId = req.query.eventId as string | undefined;
      const status = req.query.status as string | undefined;
      
      // Create filters object
      const filters = {
        eventId,
        status
      };
      
      // Generate CSV
      const csvData = await this.reportManager.exportRegistrationsToCSV(filters);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=registrations-export.csv');
      
      // Send CSV data
      res.send(csvData);
    });
  }
  
  // Export workshops to CSV (admin only)
  async exportWorkshopsCSV(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      // Get query parameters for filters
      const eventId = req.query.eventId as string | undefined;
      const published = req.query.published as string | undefined;
      
      // Create filters object
      const filters = {
        eventId,
        published
      };
      
      // Generate CSV
      const csvData = await this.reportManager.exportWorkshopsToCSV(filters);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=workshops-export.csv');
      
      // Send CSV data
      res.send(csvData);
    });
  }
  
  // Export attendance data to CSV (admin only)
  async exportAttendanceCSV(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      // Get query parameters for filters
      const category = req.query.category as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      // Create filters object
      const filters = {
        category,
        startDate,
        endDate
      };
      
      // Generate CSV
      const csvData = await this.reportManager.exportAttendanceToCSV(filters);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-export.csv');
      
      // Send CSV data
      res.send(csvData);
    });
  }
}
