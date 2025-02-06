import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import Note from "../models/Notes";
import { supabase } from "../config/supabaseClient";
import { authMiddleware } from "../middleware/authMiddleware";
import multer from "multer";
import { ObjectId } from "mongodb"; // If using MongoDB

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

router.patch(
  "/update/:noteId",
  authMiddleware,
  upload.fields([{ name: "images", maxCount: 5 }]),
  async (req, res) => {
    try {
      const { noteId } = req.params;
      const { title, content, timestamp } = req.body;

      // Parse imagesToRemove from JSON string to array
      const imagesToRemove = req.body.imagesToRemove
        ? JSON.parse(req.body.imagesToRemove)
        : [];

      const files = req.files as { images?: Express.Multer.File[] } | undefined;

      console.log("Update request for note:", noteId);
      console.log("Received body:", req.body);
      console.log("Images to remove:", imagesToRemove);
      console.log("Files received:", files ? files.images?.length : 0);

      // Fetch existing note
      let note = await Note.findById(noteId);
      if (!note) {
        return res
          .status(404)
          .json({ success: false, error: "Note not found" });
      }

      // Ensure the user owns the note
      if (req.user && note.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      /** ============================
       * STEP 1: REMOVE OLD IMAGES
       ============================ */
      let updatedImageUrls = [...note.images];

      if (
        imagesToRemove &&
        Array.isArray(imagesToRemove) &&
        imagesToRemove.length > 0
      ) {
        // First, filter out the removed images from updatedImageUrls
        updatedImageUrls = updatedImageUrls.filter(
          (imgUrl) => !imagesToRemove.includes(imgUrl)
        );

        // Then, delete the images from Supabase storage
        for (const imgUrl of imagesToRemove) {
          try {
            // Extract path from the public URL
            const urlParts = imgUrl.split("/media/");
            if (urlParts.length < 2) continue;

            const filePath = `images/${urlParts[1]}`;
            console.log("Attempting to delete:", filePath);

            const { error } = await supabase.storage
              .from("media")
              .remove([filePath]);

            if (error) {
              console.error("Error deleting image from storage:", error);
              // Continue with the loop even if one deletion fails
            } else {
              console.log(`Successfully deleted image: ${imgUrl}`);
            }
          } catch (error) {
            console.error(`Failed to delete image ${imgUrl}:`, error);
            // Continue with the loop even if one deletion fails
          }
        }
      }

      /** ============================
       * STEP 2: ADD NEW IMAGES
       ============================ */
      if (files?.images) {
        if (updatedImageUrls.length + files.images.length > 5) {
          return res.status(400).json({
            success: false,
            error: "Maximum of 5 images allowed per note",
          });
        }

        for (const imageFile of files.images) {
          const imageFileName = `${uuidv4()}-${imageFile.originalname}`;
          console.log("Uploading new image:", imageFileName);

          const { data, error } = await supabase.storage
            .from("media")
            .upload(`images/${imageFileName}`, imageFile.buffer, {
              contentType: imageFile.mimetype,
            });

          if (error) {
            console.error("Supabase image upload error:", error);
            throw error;
          }

          const { data: imageUrlData } = supabase.storage
            .from("media")
            .getPublicUrl(`images/${imageFileName}`);

          updatedImageUrls.push(imageUrlData.publicUrl);
          console.log("Image uploaded successfully:", imageUrlData.publicUrl);
        }
      }

      /** ============================
       * STEP 3: UPDATE NOTE DATA
       ============================ */
      note.title = title || note.title;
      note.content = content || note.content;
      note.timestamp = timestamp || note.timestamp;
      note.images = updatedImageUrls;

      await note.save();

      res.status(200).json({
        success: true,
        data: note,
      });
    } catch (error: any) {
      console.error("Error updating note:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update note",
      });
    }
  }
);

// DELETE route to remove a note and its files
router.delete("/delete-note/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid (for MongoDB, ensure it's a valid ObjectId)
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    // Find the note in the database
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Extract file paths from the note (assuming note.images is an array of URLs)
    const imagePaths =
      note.images?.map((url: string) => url.split("/").pop()) || [];
    const audioPath = note.audio ? note.audio.split("/").pop() : null;

    // Delete images from Supabase storage
    if (imagePaths.length > 0) {
      const { data, error } = await supabase.storage
        .from("media") // Adjust storage bucket name
        .remove(imagePaths);

      if (error) {
        console.error("Error deleting images:", error.message);
      }
    }

    // Delete audio file from Supabase storage
    if (audioPath) {
      const { error } = await supabase.storage
        .from("media") // Adjust storage bucket name
        .remove([audioPath]);

      if (error) {
        console.error("Error deleting audio:", error.message);
      }
    }

    // Delete the note from the database
    await Note.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Note and associated files deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/fav/:noteId", async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);

    if (!note) {
      res.status(404).send({ message: "There was not not found" });
    }

    note.fav = !note.fav;
    await note.save();

    res.send({ message: "Success" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
