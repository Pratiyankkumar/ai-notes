import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { authMiddleware } from "../middleware/authMiddleware";
import { z } from "zod";

const router = Router();

// Zod validation schema for updating user
const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

// Utility function for sending error responses
const handleErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  details?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};

// Get User Profile (Read)
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return handleErrorResponse(
        res,
        401,
        "Unauthorized: No user found in request."
      );
    }

    res.json({ success: true, user: req.user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return handleErrorResponse(res, 500, "Error fetching user data");
  }
});

// Update User Profile
router.put("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return handleErrorResponse(
        res,
        401,
        "Unauthorized: No user found in request."
      );
    }

    const parsedBody = updateUserSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return handleErrorResponse(
        res,
        400,
        "Validation failed",
        parsedBody.error.format()
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      parsedBody.data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return handleErrorResponse(res, 404, "User not found");
    }

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return handleErrorResponse(res, 500, "Error updating user");
  }
});

// Delete User
router.delete("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return handleErrorResponse(
        res,
        401,
        "Unauthorized: No user found in request."
      );
    }

    const deletedUser = await User.findByIdAndDelete(req.user._id);

    if (!deletedUser) {
      return handleErrorResponse(res, 404, "User not found");
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return handleErrorResponse(res, 500, "Error deleting user");
  }
});

export default router;
