import "dotenv/config";
import mongoose from "mongoose";

const DB_STRING = process.env.DB_STRING as string;

function connectDB() {
  mongoose
    .connect(DB_STRING)
    .then(() => {
      console.log("✅ Connected to MongoDB successfully");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1); // Exit if cannot connect to database
    });
}

export default connectDB;
