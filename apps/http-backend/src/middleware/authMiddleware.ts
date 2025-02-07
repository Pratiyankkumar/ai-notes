import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Document, Types } from "mongoose";

const JWT_SECRET = process.env.MY_JWT_SECRET as string;

// Extend Express Request type to include user
declare module "express" {
  interface Request {
    user?: AuthenticatedUser;
  }
}

// Define the shape of the authenticated user
interface AuthenticatedUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
}

export interface IUser extends Document {
  id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  tokens: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization header missing or invalid" });
    }

    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Convert userId to ObjectId
    const userId = new Types.ObjectId(decoded.userId);

    // Find user and validate token from DB
    const userDoc = (await User.findById(userId)) as IUser | null;

    if (!userDoc || !userDoc.tokens.includes(token)) {
      return res
        .status(401)
        .json({ message: "User not found or token invalid" });
    }

    // Attach user to request object (excluding password for security)
    req.user = {
      _id: userDoc._id as Types.ObjectId,
      email: userDoc.email,
      name: userDoc.name,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    res
      .status(500)
      .json({ message: "Internal server error during authentication" });
  }
};
