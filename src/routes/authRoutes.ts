import { BaseRouter } from "./BaseRouter.js";
import { AuthController } from "../controllers/AuthController.js";

export class AuthRouter extends BaseRouter {
  private controller = new AuthController();

  constructor() {
    super();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    // Login
    this.router.get(
      "/login",
      this.controller.showLoginForm.bind(this.controller)
    );
    this.router.post("/login", this.controller.login.bind(this.controller));

    // Registration
    this.router.get(
      "/register",
      this.controller.showRegisterForm.bind(this.controller)
    );
    this.router.post(
      "/register",
      this.controller.register.bind(this.controller)
    );

    // Logout
    this.router.get("/logout", this.controller.logout.bind(this.controller));
  }
}

const authRouter = new AuthRouter();
export default authRouter.router;
