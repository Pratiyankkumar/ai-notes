import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import Note from "../models/Notes";
import { supabase } from "../config/supabaseClient";
import { authMiddleware } from "../middleware/authMiddleware";
import multer from "multer";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post(
  "/upload",
  authMiddleware,
  upload.fields([
    { name: "audioBlob", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { title, content, timestamp } = req.body;
      const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | undefined;

      // Add request logging
      console.log("Request body:", req.body);
      console.log("Files received:", files ? Object.keys(files) : "No files");

      let audioUrl = null;
      let imageUrls: string[] = [];

      // Handle audio upload
      if (files?.audioBlob?.[0]) {
        const audioFile = files.audioBlob[0];
        console.log("Processing audio file:", audioFile.originalname);
        const audioFileName = `${uuidv4()}.webm`;

        try {
          const { data: audioUpload, error: audioError } =
            await supabase.storage
              .from("media")
              .upload(`audio/${audioFileName}`, audioFile.buffer, {
                contentType: audioFile.mimetype,
                cacheControl: "3600",
              });

          if (audioError) {
            console.error("Supabase audio upload error:", audioError);
            throw audioError;
          }

          const { data: audioUrlData } = supabase.storage
            .from("media")
            .getPublicUrl(`audio/${audioFileName}`);

          audioUrl = audioUrlData.publicUrl;
          console.log("Audio uploaded successfully:", audioUrl);
        } catch (error) {
          console.error("Audio upload error:", error);
          throw new Error("Failed to upload audio");
        }
      }

      // Handle image uploads
      if (files?.images) {
        console.log(`Processing ${files.images.length} images`);
        for (const imageFile of files.images) {
          try {
            const imageFileName = `${uuidv4()}-${imageFile.originalname}`;
            console.log("Processing image:", imageFileName);

            const { data: imageUpload, error: imageError } =
              await supabase.storage
                .from("media")
                .upload(`images/${imageFileName}`, imageFile.buffer, {
                  contentType: imageFile.mimetype,
                  cacheControl: "3600",
                });

            if (imageError) {
              console.error("Supabase image upload error:", imageError);
              throw imageError;
            }

            const { data: imageUrlData } = supabase.storage
              .from("media")
              .getPublicUrl(`images/${imageFileName}`);

            imageUrls.push(imageUrlData.publicUrl);
            console.log("Image uploaded successfully:", imageUrlData.publicUrl);
          } catch (error) {
            console.error("Image upload error:", error);
            throw new Error("Failed to upload image");
          }
        }
      }

      const note = new Note({
        title,
        content,
        images: imageUrls,
        audio: audioUrl,
        timestamp,
        user: req.user?._id,
      });

      await note.save();
      console.log("Note saved successfully:", {
        id: note._id,
        hasAudio: !!audioUrl,
        imageCount: imageUrls.length,
      });

      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error: any) {
      console.error("Error in upload route:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to process upload",
      });
    }
  }
);

router.get("/get", authMiddleware, async (req, res) => {
  try {
    // Fetch notes that belong to the authenticated user
    const notes = await Note.find({ user: req.user && req.user._id });

    res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
      error,
    });
  }
});

export default router;
