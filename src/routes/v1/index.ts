import { Router } from "express";
import authRoutes from "../authRoutes";
import nftRoutes from "../nftRoutes";
import userRoutes from "../userRoutes";
import metricsRoutes from "../../modules/metrics/routes/metrics.routes";
import certificateRoutes from "../certificatesRoutes";
import volunteerRoutes from "../VolunteerRoutes";
import projectRoutes from "../ProjectRoutes";
import organizationRoutes from "../OrganizationRoutes";

const v1Router = Router();

/**
 * V1 API Routes
 * All routes are namespaced under /v1/
 */

// Authentication routes - /v1/auth/*
v1Router.use("/auth", authRoutes);

// NFT routes - /v1/nft/*
v1Router.use("/nft", nftRoutes);

// User routes - /v1/users/*
v1Router.use("/users", userRoutes);

// Metrics routes - /v1/metrics/*
v1Router.use("/metrics", metricsRoutes);

// Certificate routes - /v1/certificate/*
v1Router.use("/certificate", certificateRoutes);

// Project routes - /v1/projects/*
v1Router.use("/projects", projectRoutes);

// Volunteer routes - /v1/volunteers/*
v1Router.use("/volunteers", volunteerRoutes);

// Organization routes - /v1/organizations/*
v1Router.use("/organizations", organizationRoutes);

export default v1Router;
