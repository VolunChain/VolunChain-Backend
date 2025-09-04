import express, { Router, Application, ErrorRequestHandler } from "express";
import cors from "cors";
import { Logger } from "./utils";

interface ServerOptions {
  port?: number;
  environment?: string;
  routes: Router;
  middlewares?: Array<(app: Application) => void>;
  errorHandlers?: ErrorRequestHandler[];
  enableCors?: boolean;
}

export class Server {
  public readonly app: Application = express();
  private readonly port: number;
  private readonly environment: string;
  private readonly routes: Router;
  private readonly middlewares: Array<(app: Application) => void>;
  private readonly errorHandlers: ErrorRequestHandler[];
  private readonly logger: Logger;
  private readonly enableCors: boolean;

  constructor(options: ServerOptions) {
    const {
      port = 3000,
      environment = "development",
      routes,
      middlewares = [],
      errorHandlers = [],
      enableCors = true,
    } = options;

    this.port = port;
    this.environment = environment;
    this.routes = routes;
    this.middlewares = middlewares;
    this.errorHandlers = errorHandlers;
    this.enableCors = enableCors;
    this.logger = new Logger("VolunChain-Server");
  }

  private setupBaseMiddlewares(): void {
    // Middleware for parsing JSON requests
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS if enabled
    if (this.enableCors) {
      this.app.use(cors());
    }
  }

  private setupCustomMiddlewares(): void {
    // Apply custom middlewares in order
    this.middlewares.forEach((middleware) => {
      middleware(this.app);
    });
  }

  private setupRoutes(): void {
    // Setup routes
    this.app.use(this.routes);
  }

  private setupHealthCheck(): void {
    // Basic health check route
    this.app.get("/", (req, res) => {
      res.json({
        message: "VolunChain API is running!",
        environment: this.environment,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupErrorHandlers(): void {
    // Apply error handlers (must be last)
    this.errorHandlers.forEach((errorHandler) => {
      this.app.use(errorHandler);
    });
  }

  public async start(): Promise<void> {
    try {
      // Setup middlewares in order
      this.setupBaseMiddlewares();
      this.setupCustomMiddlewares();
      this.setupHealthCheck();
      this.setupRoutes();
      this.setupErrorHandlers(); // Error handlers must be last

      // Start server
      return new Promise((resolve) => {
        this.app.listen(this.port, () => {
          this.logger.info(
            `Server is running on http://localhost:${this.port}`,
            {
              port: this.port,
              environment: this.environment,
              nodeVersion: process.version,
            }
          );
          resolve();
        });
      });
    } catch (error: unknown) {
      this.logger.error("Failed to start server", error ?? "error");
      throw error;
    }
  }

  public getApp(): Application {
    return this.app;
  }

  public getPort(): number {
    return this.port;
  }
}
