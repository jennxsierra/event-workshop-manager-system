import { BaseRouter } from "./BaseRouter.js";
import { ReportController } from "../controllers/ReportController.js";
import { authorize } from "../middleware/auth.js";
import { Role } from "../models/user/Role.js";

export class ReportRouter extends BaseRouter {
  private controller = new ReportController();

  constructor() {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    // All report routes are admin only
    this.router.get(
      "/",
      authorize([Role.ADMIN]),
      this.controller.getReportsDashboard.bind(this.controller)
    );
    this.router.get(
      "/events",
      authorize([Role.ADMIN]),
      this.controller.getEventReports.bind(this.controller)
    );
    this.router.get(
      "/attendance",
      authorize([Role.ADMIN]),
      this.controller.getAttendanceReports.bind(this.controller)
    );
    this.router.get(
      "/exports",
      authorize([Role.ADMIN]),
      this.controller.getExports.bind(this.controller)
    );
  }
}

const reportRouter = new ReportRouter();
export default reportRouter.router;
