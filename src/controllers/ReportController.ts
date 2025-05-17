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

  // Generate and show summary report (admin only)
  async getSummaryReport(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const report = await this.reportManager.generateSummaryReport();
      this.render(res, "reports/summary", { report });
    });
  }

  // Generate and show detailed report (admin only)
  async getDetailedReport(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const report = await this.reportManager.generateDetailedReport();
      this.render(res, "reports/detailed", { report });
    });
  }

  // Generate and show historical report (admin only)
  async getHistoricalReport(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      const report = await this.reportManager.generateHistoricalReport();
      this.render(res, "reports/historical", { report });
    });
  }

  // Show reports dashboard (admin only)
  async getReportsDashboard(req: Request, res: Response): Promise<void> {
    await this.handleAsync(req, res, async () => {
      // Check if user is admin
      if (!req.user || req.user.role !== Role.ADMIN) {
        return this.renderError(res, "Unauthorized", 403);
      }

      this.render(res, "reports/dashboard");
    });
  }
}
