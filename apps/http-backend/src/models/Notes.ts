import { string } from "zod";

const mongoose = require("mongoose");
const { Schema } = mongoose;

// Note Schema
const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [100, "Title cannot be more than 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    images: {
      type: [{ type: String }],
      default: [], // Makes the images array optional with empty array as default
    },
    audio: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Note must belong to a user"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better query performance
noteSchema.index({ user: 1, timestamp: -1 });

const Note = mongoose.model("Note", noteSchema);

export default Note;
