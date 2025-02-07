import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { z } from "zod";
import "dotenv/config";

const JWT_SECRET = process.env.MY_JWT_SECRET as string;

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const authController = {
  async signup(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = signupSchema.parse(req.body);
      const { name, email, password } = validatedData;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      const user = new User({ name, email, password });
      await user.save();

      // Generate token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "24h",
      });

      // Save token in DB
      user.tokens.push(token);
      await user.save();

      res.status(201).json({ user, token });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
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

      // Save token in DB
      user.tokens.push(token);
      await user.save();

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  },
};
