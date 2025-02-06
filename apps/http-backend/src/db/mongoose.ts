import mongoose from "mongoose";

function connectDB() {
  mongoose
    .connect(
      "mongodb+srv://pratiyank49:NcQttk0T4neWqkeX@cluster0.2rijj.mongodb.net/ai-notes"
    )
    .then(() => {
      console.log("✅ Connected to MongoDB successfully");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1); // Exit if cannot connect to database
    });
}

export default connectDB;
