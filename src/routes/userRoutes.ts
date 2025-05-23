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

    // Update user profile - handle both cases
    this.router.post(
      "/profile",
      this.controller.updateProfile.bind(this.controller)
    );
    
    // Change password route
    this.router.put(
      "/profile/password",
      this.controller.changePassword.bind(this.controller)
    );
    
    // Add POST route for updating specific users (for the form submission)
    this.router.post(
      "/:id",
      this.controller.updateProfile.bind(this.controller)
    );

    // Keep the PUT route for backwards compatibility
    this.router.put(
      "/:id",
      this.controller.updateProfile.bind(this.controller)
    );

    // Edit user profile
    this.router.get(
      "/edit/:id?",
      this.controller.showEditProfileForm.bind(this.controller)
    );

    // Support /users/:id/edit format for the edit route
    this.router.get(
      "/:id/edit",
      this.controller.showEditProfileForm.bind(this.controller)
    );

    // Delete user (admin only)
    this.router.delete(
      "/:id",
      authorize([Role.ADMIN]),
      this.controller.deleteUser.bind(this.controller)
    );

    // Admin only routes
    this.router.get(
      "/",
      authorize([Role.ADMIN]),
      this.controller.getUsers.bind(this.controller)
    );
    
    // Create user form (admin only)
    this.router.get(
      "/create",
      authorize([Role.ADMIN]),
      this.controller.showCreateForm.bind(this.controller)
    );
    
    // Create user submission (admin only)
    this.router.post(
      "/",
      authorize([Role.ADMIN]),
      this.controller.createUser.bind(this.controller)
    );
  }
}

const userRouter = new UserRouter();
export default userRouter.router;
