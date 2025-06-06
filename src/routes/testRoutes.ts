import express from "express";
import { prisma } from "../config/prisma";

const router = express.Router();

// Test route for database performance
router.get("/db-test", async (req, res) => {
  try {
    // Perform multiple queries to test connection pooling
    const startTime = Date.now();

    // Parallel queries to test connection pool
    const [users, organizations, projects] = await Promise.all([
      prisma.user.findMany({ take: 5 }),
      prisma.organization.findMany({ take: 5 }),
      prisma.project.findMany({ take: 5 }),
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    res.json({
      success: true,
      duration: `${duration}ms`,
      results: {
        users: users.length,
        organizations: organizations.length,
        projects: projects.length,
      },
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      success: false,
      error: "Database test failed",
    });
  }
});

export default router;
