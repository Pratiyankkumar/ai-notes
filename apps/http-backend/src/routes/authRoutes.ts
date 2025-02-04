import express from "express";
import { authController } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

export default router;
