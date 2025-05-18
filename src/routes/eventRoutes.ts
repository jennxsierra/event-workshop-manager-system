import { BaseRouter } from "./BaseRouter.js";
import { EventController } from "../controllers/EventController.js";
import { authorize } from "../middleware/auth.js";
import { Role } from "../models/user/Role.js";

export class EventRouter extends BaseRouter {
  private controller: EventController;

  constructor() {
    super();
    this.controller = new EventController();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    // Public routes
    this.router.get("/", this.controller.getEvents.bind(this.controller));
    this.router.get(
      "/:id",
      this.controller.getEventDetails.bind(this.controller)
    );

    // Protected routes (staff and admin only)
    this.router.get(
      "/new",
      authorize([Role.STAFF, Role.ADMIN]),
      this.controller.showCreateEventForm.bind(this.controller)
    );
    this.router.post(
      "/",
      authorize([Role.STAFF, Role.ADMIN]),
      this.controller.createEvent.bind(this.controller)
    );
    this.router.get(
      "/:id/edit",
      authorize([Role.STAFF, Role.ADMIN]),
      this.controller.showEditEventForm.bind(this.controller)
    );
    this.router.put(
      "/:id",
      authorize([Role.STAFF, Role.ADMIN]),
      this.controller.updateEvent.bind(this.controller)
    );

    // Admin only routes
    this.router.delete(
      "/:id",
      authorize([Role.ADMIN]),
      this.controller.deleteEvent.bind(this.controller)
    );
  }
}

const eventRouter = new EventRouter();
export default eventRouter.router;
