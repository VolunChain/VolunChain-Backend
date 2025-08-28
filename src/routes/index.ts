import { Router } from "express";
import authRoutes from "./authRoutes";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API version info
router.get("/", (req, res) => {
  res.json({
    message: "VolunChain API",
    version: "1.0.0",
    status: "active",
    documentation: "/api/docs",
  });
});

// Mount all routes
router.use("/auth", authRoutes);

// TODO: Add other routes as they are tested and ready
// router.use("/users", userRoutes);
// router.use("/organizations", organizationRoutes);
// router.use("/projects", projectRoutes);
// router.use("/volunteers", volunteerRoutes);
// router.use("/certificates", certificateRoutes);
// router.use("/nft", nftRoutes);
// router.use("/metrics", metricsRoutes);

export default router;
