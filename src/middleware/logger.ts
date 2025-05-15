import morgan from "morgan";
import chalk from "chalk";
import { Request } from "express";

// Define a custom token to log the request body
morgan.token("body", (req: Request) => JSON.stringify(req.body));

// Define a custom token to log the timestamp in a more readable format
morgan.token("timestamp", () => {
  const now = new Date();
  return now.toLocaleString();
});

// Define a custom token to color-code the HTTP method
morgan.token("methodColored", (req: Request) => {
  const method = req.method;
  switch (method) {
    case "GET":
      return chalk.green(method);
    case "POST":
      return chalk.blue(method);
    case "PATCH":
      return chalk.cyan(method);
    case "PUT":
      return chalk.yellow(method);
    case "DELETE":
      return chalk.red(method);
    default:
      return chalk.white(method);
  }
});

// Define a custom token to color-code the status code
morgan.token("statusColored", (_req, res) => {
  const status = res.statusCode;
  if (status >= 500) return chalk.red(status.toString());
  if (status >= 400) return chalk.red(status.toString());
  if (status >= 300) return chalk.cyan(status.toString());
  if (status >= 200) return chalk.green(status.toString());
  return chalk.white(status.toString());
});

// Create a custom format that includes color-coded tokens
const customFormat = [
  chalk.gray("[:timestamp]"),
  ":methodColored",
  ":url",
  ":statusColored",
  chalk.yellow(":response-time ms"),
  chalk.white(":body"),
].join(" ");

const logger = morgan(customFormat, {
  skip: (req: Request) => {
    // Skip logging for requests to static files with specific extensions
    const skipExtensions = [
      ".css",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".svg",
      ".ico",
    ];

    // Skip favicon requests
    if (req.url === "/favicon.ico" || req.url.includes("/favicon/")) {
      return true;
    }

    // Skip other static file extensions
    return skipExtensions.some((ext) => req.url.endsWith(ext));
  },
});

export default logger;