import { Request, Response } from "express";
import { BaseController } from "./BaseController.js";
import { EventManager } from "../models/manager/EventManager.js";
import { ReportManager } from "../models/manager/ReportManager.js";
import { Role } from "../models/user/Role.js";

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

      const report = await this.reportManager.generateSummaryReport();
      this.render(res, "reports/events", {
        report,
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

      const report = await this.reportManager.generateDetailedReport();
      this.render(res, "reports/attendance", {
        report,
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

      const report = await this.reportManager.generateHistoricalReport();
      this.render(res, "reports/exports", {
        report,
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
}
