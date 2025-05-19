import { Request, Response } from "express";

export abstract class BaseController {
  protected success<T>(res: Response, data: T, status = 200): Response {
    return res.status(status).json({
      success: true,
      data,
    });
  }

  protected render(res: Response, view: string, data = {}, status = 200): void {
  const userData = res.req.user ? { user: res.req.user } : {};
  res.status(status).render(view, { ...userData, ...data });
}

  protected error(res: Response, message: string, status = 500): Response {
    return res.status(status).json({
      success: false,
      message,
    });
  }

  protected renderError(res: Response, message: string, status = 500): void {
    this.render(res, "error", { message }, status);
  }

  protected redirectWithMessage(
    res: Response,
    url: string,
    message: string,
    type = "success"
  ): void {
    // Store flash message in session
    if (res.req.session) {
      // Store in session flash
      if (!res.req.session.messages) {
        res.req.session.messages = {};
      }
      if (
        type === "success" ||
        type === "error" ||
        type === "warning" ||
        type === "info"
      ) {
        res.req.session.messages[type] = message;
      } else {
        // Default to success if unknown type
        res.req.session.messages.success = message;
      }
    }

    // Debug log
    console.log(`Setting message: ${message} of type ${type}`);

    res.redirect(url);
  }

  protected async handleAsync(
    _req: Request,
    res: Response,
    fn: () => Promise<void>
  ): Promise<void> {
    try {
      await fn();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      this.renderError(res, message);
    }
  }
}
