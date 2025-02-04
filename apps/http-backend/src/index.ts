import express from "express";
import authRoutes from "./routes/authRoutes";
import connectDB from "./db/mongoose";
import { authMiddleware } from "./middleware/authMiddleware";

const app = express();
const port = process.env.PORT || 3000;

connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Register auth routes
app.use("/api/auth", authRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to http-backend",
    endpoints: {
      signup: "/api/auth/signup",
      login: "/api/auth/login",
    },
  });
});

app.get("/protected", authMiddleware, async (req, res) => {
  res.send({
    user: req.user,
    message: "This route is protected by middleware",
  });
});

app.listen(port, () => {
  console.log(`✨ Server is running on http://localhost:${port}`);
  console.log("📍 Available endpoints:");
  console.log("   POST /api/auth/signup - Create a new account");
  console.log("   POST /api/auth/login  - Login to existing account");
});
