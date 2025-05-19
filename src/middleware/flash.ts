import { Request, Response, NextFunction } from "express";

export const flashMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Transfer messages from session to res.locals for use in views
  if (req.session.messages) {
    res.locals.messages = req.session.messages;
    // Clear the messages after transferring to prevent displaying on subsequent requests
    req.session.messages = {};
  }
  next();
};
