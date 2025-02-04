import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const JWT_SECRET = "my-secret";

export const authController = {
  async signup(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      const user = new User({ email, password });
      await user.save();

      // Generate token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.status(201).json({ token });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // Generate token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  },
};
