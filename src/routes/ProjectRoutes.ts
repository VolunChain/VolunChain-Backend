import { Router } from "express";
import ProjectController from "../controllers/Project.controller";

const router = Router();
const projectController = new ProjectController();

router.post("/projects", async (req, res) =>
  projectController.createProject(req, res)
);
router.get("/projects/:id", async (req, res) =>
  projectController.getProjectById(req, res)
);
router.get("/organizations/:organizationId/projects", async (req, res) =>
  projectController.getProjectsByOrganizationId(req, res)
);

export default router;
