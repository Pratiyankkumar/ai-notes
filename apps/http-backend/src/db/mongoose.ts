import mongoose from "mongoose";

function connectDB() {
  mongoose
    .connect("mongodb://localhost:27017/ai-notes")
    .then(() => {
      console.log("✅ Connected to MongoDB successfully");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1); // Exit if cannot connect to database
    });
}

export default connectDB;
