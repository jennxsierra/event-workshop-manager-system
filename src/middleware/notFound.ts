import { Request, Response } from "express";

const notFound = (_req: Request, res: Response) => {
  res.status(404);
  res.render("error", { message: "Page Not Found" });
};

export default notFound;
