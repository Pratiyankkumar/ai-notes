import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Document, Types } from "mongoose";

const JWT_SECRET = "my-secret";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization header must start with Bearer",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userDoc = await User.findById(decoded.userId);

    if (!userDoc) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Ensure we're working with a properly typed document
    const user = {
      _id: userDoc._id as Types.ObjectId, // Explicitly type as ObjectId
      email: userDoc.email,
      password: userDoc.password,
      _v: userDoc.__v,
    };

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
    res.status(500).json({
      message: "Internal server error during authentication",
    });
  }
};
