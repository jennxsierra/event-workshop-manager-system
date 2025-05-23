import { BaseRouter } from "./BaseRouter.js";
import { RegistrationController } from "../controllers/RegistrationController.js";
import { authorize } from "../middleware/auth.js";
import { Role } from "../models/user/Role.js";

export class RegistrationRouter extends BaseRouter {
  private controller = new RegistrationController();

  constructor() {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    // User routes (register/cancel)
    this.router.post(
      "/events/:id/register",
      this.controller.registerForEvent.bind(this.controller)
    );
    this.router.post(
      "/events/:id/cancel",
      this.controller.cancelRegistration.bind(this.controller)
    );

    // Registration view routes - accessible by all users
    this.router.get(
      "/",
      this.controller.viewMyRegistrations.bind(this.controller)
    );

    // Admin/staff management routes
    this.router.get(
      "/manage", 
      authorize([Role.STAFF, Role.ADMIN]),
      this.controller.viewAllRegistrations.bind(this.controller)
    );
    
    // Attendance management route
    this.router.post(
      "/:id/attendance",
      authorize([Role.STAFF, Role.ADMIN]),
      this.controller.markAttendance.bind(this.controller)
    );
    
    // Cancel/restore registration by ID routes
    this.router.post(
      "/:id/cancel",
      authorize([Role.STAFF, Role.ADMIN]),
      this.controller.cancelRegistrationById.bind(this.controller)
    );
    
    this.router.post(
      "/:id/restore",
      authorize([Role.STAFF, Role.ADMIN]),
      this.controller.restoreRegistration.bind(this.controller)
    );
  }
}

const registrationRouter = new RegistrationRouter();
export default registrationRouter.router;
