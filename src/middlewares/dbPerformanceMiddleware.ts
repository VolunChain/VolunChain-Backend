import { Request, Response, NextFunction } from "express";
import { performance } from "perf_hooks";
import { dbMonitor } from "../config/prisma";

export const dbPerformanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.ENABLE_QUERY_LOGGING !== "true") {
    return next();
  }

  const startTime = performance.now();
  const path = req.path;
  const method = req.method;

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(
      `[${method}] ${path} - Total Duration: ${duration.toFixed(2)}ms`
    );
    console.log(
      `Average Query Time: ${dbMonitor.getAverageQueryTime().toFixed(2)}ms`
    );

    return originalSend.call(this, body);
  };

  next();
};
