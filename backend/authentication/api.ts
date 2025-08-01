import { Router } from "express";
import { requireAuth } from '../middleware/requireAuth';
import {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../services/functions";

const apiRouter = Router();


// GET all applications
apiRouter.get(
  "/applications",
  requireAuth,
  async (req, res) => {
    try {
      const userId = (req as any).userId;
      const apps = await getAllApplications(userId);
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Error fetching applications", error });
    }
  }
);

// GET application by ID
apiRouter.get(
  "/applications/:id",
  async (req, res) => {
    try {
      const app = await getApplicationById(req.params.id);
      if (!app) return res.status(404).json({ message: "Application not found" });
      res.json(app);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

// CREATE application
apiRouter.post(
  "/applications",
  requireAuth,
  async (req, res) => {
    try {
      const newApp = await createApplication({
        ...req.body,
        user: (req as any).userId
      });
      res.status(201).json(newApp);
    } catch (error) {
      res.status(400).json({ message: "Error creating application", error });
    }
  }
);

// UPDATE application
apiRouter.put(
  "/applications/:id",
  requireAuth,
  async (req, res) => {
    try {
      const updatedApp = await updateApplication(req.params.id, req.body);
      if (!updatedApp)
        return res.status(404).json({ message: "Application not found" });
      res.json(updatedApp);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

// DELETE application
apiRouter.delete(
  "/applications/:id",
  requireAuth,
  async (req, res) => {
    try {
      const deletedApp = await deleteApplication(req.params.id);
      if (!deletedApp)
        return res.status(404).json({ message: "Application not found" });
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

// GET all users
apiRouter.get(
  "/users",
  async (req, res) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  }
);

// GET user by ID
apiRouter.get(
  "/users/:id",
  async (req, res) => {
    try {
      const user = await getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

// CREATE user
apiRouter.post(
  "/users",
  async (req, res) => {
    try {
      const newUser = await createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: "Error creating user", error });
    }
  }
);

// UPDATE user
apiRouter.put(
  "/users/:id",
  async (req, res) => {
    try {
      const updatedUser = await updateUser(req.params.id, req.body);
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

// DELETE user
apiRouter.delete(
  "/users/:id",
  async (req, res) => {
    try {
      const deletedUser = await deleteUser(req.params.id);
      if (!deletedUser) return res.status(404).json({ message: "User not found" });
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default apiRouter;