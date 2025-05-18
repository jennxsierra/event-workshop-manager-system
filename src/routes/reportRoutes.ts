import { BaseRouter } from "./BaseRouter.js";
import { ReportController } from "../controllers/ReportController.js";
import { authorize } from "../middleware/auth.js";
import { Role } from "../models/user/Role.js";

export class ReportRouter extends BaseRouter {
  private controller = new ReportController();

  protected initializeRoutes(): void {
    // All report routes are admin only
    this.router.get(
      "/",
      authorize([Role.ADMIN]),
      this.controller.getReportsDashboard.bind(this.controller)
    );
    this.router.get(
      "/summary",
      authorize([Role.ADMIN]),
      this.controller.getSummaryReport.bind(this.controller)
    );
    this.router.get(
      "/detailed",
      authorize([Role.ADMIN]),
      this.controller.getDetailedReport.bind(this.controller)
    );
    this.router.get(
      "/historical",
      authorize([Role.ADMIN]),
      this.controller.getHistoricalReport.bind(this.controller)
    );
  }
}

const reportRouter = new ReportRouter();
export default reportRouter.router;
