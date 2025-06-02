import { Router } from "express";
import v1Router from "./v1";

const apiRouter = Router();

/**
 * API Versioning Router
 * 
 * This router handles API versioning by namespacing routes under version prefixes.
 * 
 * Current versions:
 * - /v1/ - Current stable API version
 * - /v2/ - Reserved for future expansion
 */

// V1 API Routes
apiRouter.use("/v1", v1Router);

// V2 API Routes (Reserved for future expansion)
// apiRouter.use("/v2", v2Router);

// Version info endpoint
apiRouter.get("/", (req, res) => {
  res.json({
    message: "VolunChain API",
    versions: {
      v1: {
        status: "stable",
        description: "Current stable API version",
        endpoints: "/v1/"
      },
      v2: {
        status: "reserved",
        description: "Reserved for future expansion",
        endpoints: "/v2/"
      }
    },
    documentation: "/api/docs"
  });
});

export default apiRouter;
