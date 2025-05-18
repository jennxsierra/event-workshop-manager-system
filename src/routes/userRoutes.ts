import { BaseRouter } from "./BaseRouter.js";
import { UserController } from "../controllers/UserController.js";
import { authorize } from "../middleware/auth.js";
import { Role } from "../models/user/Role.js";

export class UserRouter extends BaseRouter {
  private controller = new UserController();

  constructor() {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    // Get user profile (requires authentication)
    this.router.get(
      "/profile/:id?",
      this.controller.getUserProfile.bind(this.controller)
    );

    // Edit user profile
    this.router.get(
      "/edit/:id?",
      this.controller.showEditProfileForm.bind(this.controller)
    );
    this.router.put(
      "/:id",
      this.controller.updateProfile.bind(this.controller)
    );

    // Admin only routes
    this.router.get(
      "/",
      authorize([Role.ADMIN]),
      this.controller.getUsers.bind(this.controller)
    );
  }
}

const userRouter = new UserRouter();
export default userRouter.router;
