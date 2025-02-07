import express from "express";
import authRoutes from "./routes/authRoutes";
import noteRoutes from "./routes/Note";
import connectDB from "./db/mongoose";
import userRoutes from "./routes/User";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "https://xqyndr-4000.csb.app" }));

connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Register auth routes
app.use("/api/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/notes", noteRoutes);

app.listen(port, () => {
  console.log(`✨ Server is running on http://localhost:${port}`);
  console.log("📍 Available endpoints:");
  console.log("   POST /api/auth/signup - Create a new account");
  console.log("   POST /api/auth/login  - Login to existing account");
});
