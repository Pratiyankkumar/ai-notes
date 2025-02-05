import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, buffer } = req.file;
    const filePath = `uploads/${Date.now()}_${originalname}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("media") // Replace with your bucket name
      .upload(filePath, buffer, {
        contentType: req.file.mimetype,
      });

    if (error) throw error;

    // Get public URL correctly
    const { data: urlData } = supabase.storage
      .from("media")
      .getPublicUrl(filePath);

    res
      .status(200)
      .json({ message: "File uploaded successfully", url: urlData.publicUrl });
  } catch (error) {
    res.status(500).json({ message: "Error uploading file", error });
  }
};
